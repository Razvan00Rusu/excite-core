package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"
)

type Citation_JSON struct {
	CitingCorpusID string   `json:"citingcorpusid"`
	CitedCorpusID  string   `json:"citedcorpusid"`
	IsInfluential  bool     `json:"isinfluential"`
	Contexts       []string `json:"contexts"`
	Intents        []string `json:"intents"`
	Updated        string   `json:"updated"`
}

type Citation struct {
	CitingCorpusID string
	CitedCorpusID  string
}

type Data_Extraction_Config struct {
	DataPaths        []string
	OutputPath       string
	DatasetPath      string
	DatasetCap       int
	SmallDatasetPath string
	SmallDatasetCap  int
}

type DatasetHeaders struct {
	CitingId      string
	CitedId       string
	Intent        string
	IsInfluential bool
	Context       string
}

type FilterResults struct {
	Total               uint64
	WithContext         uint64
	TotalRecords        uint64
	DatasetRecords      uint64
	SmallDatasetRecords uint64
}

func writeToFile(filename string, messages <-chan string, wg *sync.WaitGroup) {
	file, err := os.OpenFile(filename, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	for msg := range messages {
		_, err := file.WriteString(msg + "\n")
		if err != nil {
			log.Println("Error writing to file:", err)
		}
	}

	wg.Done()
}

func filterDataset(config Data_Extraction_Config) FilterResults {
	results := FilterResults{
		Total:               0,
		WithContext:         0,
		TotalRecords:        0,
		DatasetRecords:      0,
		SmallDatasetRecords: 0,
	}
	var wg sync.WaitGroup
	filterMessages := make(chan string)
	datasetMessages := make(chan string)
	smallDatasetMessages := make(chan string)

	wg.Add(3)
	go writeToFile(config.OutputPath, filterMessages, &wg)
	go writeToFile(config.DatasetPath, datasetMessages, &wg)
	go writeToFile(config.SmallDatasetPath, smallDatasetMessages, &wg)

	datasetMessages <- "citing_id,intent,is_influential,context,cited_id"
	smallDatasetMessages <- "citing_id,intent,is_influential,context,cited_id"
	for i := 0; i < len(config.DataPaths); i++ {
		file, err := os.Open(config.DataPaths[i])
		if err != nil {
			log.Fatalln("FATAL: Cannot read data file")
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		const maxCapacity int = 4194304
		buf := make([]byte, maxCapacity)
		scanner.Buffer(buf, maxCapacity)

		start := time.Now()

		for ; scanner.Scan(); results.Total++ {
			var jsonData Citation_JSON
			if jsonErr := json.Unmarshal([]byte(scanner.Text()), &jsonData); jsonErr != nil {
				fmt.Println("Error Reading JSON")
				continue
			}
			if len(jsonData.Contexts) > 0 {
				filterMessages <- scanner.Text()
				results.WithContext++

				for i := 0; i < len(jsonData.Contexts); i++ {
					var intents string
					if len(jsonData.Intents) > 0 {
						intents = jsonData.Intents[0] + ","
					} else {
						intents = ","
					}
					if config.DatasetCap == -1 || results.DatasetRecords < uint64(config.DatasetCap) {
						datasetMessages <- jsonData.CitingCorpusID + "," + intents + strconv.FormatBool(jsonData.IsInfluential) + ",\"" + jsonData.Contexts[i] + "\"," + jsonData.CitedCorpusID
						results.DatasetRecords++
					}
					if config.SmallDatasetCap == -1 || results.SmallDatasetRecords < uint64(config.SmallDatasetCap) {
						smallDatasetMessages <- jsonData.CitingCorpusID + "," + intents + strconv.FormatBool(jsonData.IsInfluential) + ",\"" + jsonData.Contexts[i] + "\"," + jsonData.CitedCorpusID
						results.SmallDatasetRecords++
					}
					results.TotalRecords++
				}
			}
			if results.Total%10000 == 0 {
				fmt.Println("INFO: Iteration ", results.Total, ", Elapsed Time: ", time.Since(start), ", contexts found: ", results.WithContext, ", total records: ", results.TotalRecords)
			}
		}

		if err := scanner.Err(); err != nil {
			log.Fatalln("FATAL: Error scanning data file", err)
		}
	}

	close(filterMessages)
	close(datasetMessages)
	close(smallDatasetMessages)
	wg.Wait()

	return results
}

func main() {
	config := Data_Extraction_Config{
		DataPaths:        []string{""},
		OutputPath:       "filtered_data",
		DatasetPath:      "dataset.csv",
		DatasetCap:       -1,
		SmallDatasetPath: "small_dataset.csv",
		SmallDatasetCap:  7200000,
	}

	filterResults := filterDataset(config)
	fmt.Println("INFO: Finished processing. Dataset statistics to follow")
	fmt.Println("INFO:", filterResults.Total, "entries")
	fmt.Println("INFO:", filterResults.WithContext, "entries with context")
	fmt.Println("INFO:", filterResults.TotalRecords, "total context records")
	fmt.Println("INFO:", filterResults.DatasetRecords, "context records in dataset")
	fmt.Println("INFO:", filterResults.SmallDatasetRecords, "context records in small dataset")
}
