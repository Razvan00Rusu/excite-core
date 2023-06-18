const z = require("zod");
const csv = require("csv-parser");
const fs = require("fs");
const readline = require("readline");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const args = yargs(hideBin(process.argv)).argv;

if (!args.inputDir) {
  console.log(
    "Error - Missing Param: inputDir flag must be specified (--inputDir ${filepath})"
  );
  process.exit(1);
}

if (!args.outputPath) {
  console.log(
    "Error - Missing Param: outputPath flag must be specified (--outputPath ${filepath})"
  );
  process.exit(1);
}

if (!args.rejectedPath) {
  console.log(
    "Error - Missing Param: rejectedPath flag must be specified (--rejectedPath ${filepath})"
  );
  process.exit(1);
}

const INPUT_PATH = args.inputDir;
const OUTPUT_PATH = args.outputPath;
const REJECTED_PATH = args.rejectedPath;

console.log("Command Line Params");
console.log(`Input Path: ${INPUT_PATH}`);
console.log(`Output Path: ${OUTPUT_PATH}`);
console.log(`Rejected Path: ${REJECTED_PATH}`);

process_input_dir(INPUT_PATH);

const schema = z.object({
  citingcorpusid: z.string(),
  citedcorpusid: z.string(),
  isinfluential: z.boolean(),
  contexts: z.array(z.string()),
  intents: z.array(z.string()).nullable(),
});

const keptStream = fs.createWriteStream(OUTPUT_PATH);
const rejectedStream = fs.createWriteStream(REJECTED_PATH);
keptStream.write(`citing_id,intent,is_influential,context,cited_id\n`);

async function processLineByLine(filePath) {
  return new Promise(async (resolve) => {
    console.log(`Starting File: ${filePath}`);
    let entries = 0;
    let kept = 0;
    let rejected = 0;
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      // Each line in input.txt will be successively available here as `line`.
      entries++;
      if (entries % 500000 === 0) {
        console.log(
          `File: ${filePath}, Processing line: ${entries}, Kept: ${kept}, Rejected: ${rejected}`
        );
      }
      try {
        const entry = schema.parse(JSON.parse(line));
        entry.citedcorpusid = z
          .string()
          .regex(/^\d+$/)
          .parse(entry.citedcorpusid);
        entry.citingcorpusid = z
          .string()
          .regex(/^\d+$/)
          .parse(entry.citingcorpusid);
        let context = entry.contexts.reduce((acc, ctx) => {
          return acc + ctx;
        }, "");
        context = context
          .substring(0, 512)
          .replace(/"/g, '""')
          .replace(/[\n\r]/g, "")
          .replace(/[\t]/g, " ");
        keptStream.write(
          `${entry.citingcorpusid},${entry.intents[0] ?? ""},${entry.isinfluential ? "True" : "False"
          },"${context}",${entry.citedcorpusid}\n`
        );
        kept++;
      } catch (error) {
        rejected++;
        rejectedStream.write(`${line}\n`);
      }
    }
    console.log(
      `Finished ${filePath}. Entries : ${entries}, Kept: ${kept}, Rejected: ${rejected}`
    );
    resolve({
      filePath,
      entries,
      kept,
      rejected,
    });
  });
}

function parseHrtimeToSeconds(hrtime) {
  return (hrtime[0] + hrtime[1] / 1e9).toFixed(3);
}

async function process_input_dir(input_path) {
  const times = [];
  const results = [];
  try {
    const files = await fs.promises.readdir(input_path);
    console.log("Files", files);
    for (let i = 0; i < files.length; i++) {
      console.log(i, files[i]);
      let startTime = process.hrtime();
      const res = await processLineByLine(input_path + files[i]);
      results.push(res);
      times.push(parseHrtimeToSeconds(process.hrtime(startTime)));

      console.log(`Progress so far: ${i} out of ${files.length}`)
      console.log(
        `Total Entries: ${results.reduce((acc, res) => {
          return (acc += res.entries);
        }, 0)}, Total Kept: ${results.reduce((acc, res) => {
          return (acc += res.kept);
        }, 0)}, Total rejected: ${results.reduce((acc, res) => {
          return (acc += res.rejected);
        }, 0)}`
      );
      results?.forEach((res) => {
        console.log(`${res.filePath}: Entries: ${res.entries}, Kept: ${res.kept}, Rejected: ${res.rejected}`)
      })
      console.log("Times", times);
      console.log(
        `Average Time: , ${times.reduce((acc, time) => {
          return (acc += time);
        }, 0) / times.length
        } s`
      );
    }
  } catch (e) {
    console.log(e);
  }

  console.log("Finished");
  console.log("Stats: ", results.length);
  console.log(
    `Total Entries: ${results.reduce((acc, res) => {
      return (acc += res.entries);
    }, 0)}, Total Kept: ${results.reduce((acc, res) => {
      return (acc += res.kept);
    }, 0)}, Total rejected: ${results.reduce((acc, res) => {
      return (acc += res.rejected);
    }, 0)}`
  );
  results?.forEach((res) => {
    console.log(`${res.filePath}: Entries: ${res.entries}, Kept: ${res.kept}, Rejected: ${res.rejected}`)
  })
  console.log("Times", times);
  console.log(
    `Average Time: , ${times.reduce((acc, time) => {
      return (acc += Number(time));
    }, 0) / times.length
    } s`
  );
}
