#PBS -lwalltime=48:00:00
#PBS -l select=1:ncpus=4:mem=64gb

cp $HOME/data_aggregation/validate_data.js ./
cp $HOME/data_aggregation/package.json ./

now=`date`
echo "Start Time: $now"

$HOME/.nvm/versions/node/v18.16.0/bin/npm install
$HOME/.nvm/versions/node/v18.16.0/bin/node validate_data.js --inputDir $EPHEMERAL/raw_unzipped/ --outputPath $EPHEMERAL/raw_unzipped/data.csv --rejectedPath $EPHEMERAL/raw_unzipped/rejected.csv

now=`date`
echo "End Time: $now"