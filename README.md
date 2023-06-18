# Context Sensivite Citation - Data Aggregation, Model Training and Inference Server

This repository contains the code for 'Excite Core' which is a set of data collection, validating and model training tools to help with the task of context-sensitive citation recommendation. This project was completed as part of an MEng Final Year Project in Electronic and Information Engineering at Imperial College London titled `Context Senstive Citation`, the full paper for which can be found [here]().

Author: Razvan Rusu

Supervisor: Dr. Dan Goodman

2nd Marker: TBC

## Related Repositories

[Excite for VSCode]()

[Oh-My-Papers]()

[Excite for Chrome/Overleaf]() (Incomplete/Abandoned)

## Acknowledgements

Work on the model is largely built upon the work done by H. Fang, Z. Zhu and H. Zhao in their paper `Oh-My-Papers: a Hybrid Context-aware Paper Recommendation System` which can be found at the `Oh-My-Papers` link in the `Related Repositories` section.

## Overview and Motivation

In the field of context-sensitive citation, models are often trained on reasonably large but restricted datasets, mostly from the field of computer vision or similar. This repository contains tools to not only find and collect data from these data sets, but also validate them to ensure consistency.

Additionally, a inference server is developed to enable front-ends such as `Excite for VSCode` to communicate with the model in a resource- and time-efficient manner.

This is designed to be an entirely modular system, i.e. each stage should be independant of others, to allow it to be iterated on, or swapped out completely for a better option in the future.

## Repository Structure
```
.
├── data_aggregation // Tools for downloading and validating data
│     └── scripts // Imperial HPC scripts
│     └── experiment
└── model // Language Server
    └── inference // Inference server interface
    └── oh-my-papers // Model logic for training and inference
    └── scripts // Imperial HPC & Misc. scripts
```

## Dependancies

This extension was developed with [NodeJS](https://nodejs.org/) v18.16.0 (the latest LTS version at time of development). Once this is installed, `npm install` can be run inside the `data_aggregation` and `model/inference` directories to install the required node modules.

Python is also needed. Developed was done in Python v3.8.16. The required modules can be found in `model/oh-my-papers/requirements.txt`.

## Usage

This section gives an overview of how the entire pipeline might look like. More detail can be found in each of the respective folders.

1. First, a dataset must be found. This repository was developed with the [Semantic Scholar Citation API](https://www.semanticscholar.org/product/api). This will give us a JS array of link strings, which can be processed with `data_aggregation/links.js` to product a text file, with one link per line.

2. Once this list of links is obtained, it can be passed through to `data_aggregation/scripts/download_data.sh` to download all of the files and then `data_aggregation/scripts/extract_data.sh` to extract them all.

3. Finally, `data_aggregation/validate_data.js` can be run on the directory containing *just* these extracted files to produce a CSV file containing the validated entries, and a seperate text file containing the rejected entries. This essentially replaced the `data preparation` step in the original `Oh-My-Papers` repository.

4. The CSV file containing valid entries can then be used to train the 3 models as described in `model/oh-my-papers`. A config file must be produced for each one as shown in the `model/oh-my-papers/configs` directory.

5. Once the models have been trained, `model/oh-my-papers/inference_citation_bert_server.py` can be run with a slimmed down config file such as `model/oh-my-papers/configs/inference_citation_bert.yaml` linking to the appropriate checkpoint files. This will launch the inference engine.

6. Finally, the inference server can be run with `node model/inference/index.js`. This will allow front-ends to connect to the server over HTTP and communicates with the inference engine over UDS.
