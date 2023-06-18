#PBS -lwalltime=06:00:00
#PBS -l select=1:ncpus=4:mem=16gb

cp $HOME/data_cleaning/dataset_links.txt ./

now=`date`
echo "Start Time: $now"

count=0
while read link; do
  curl -o "$count.gz" --create-dirs "$link"
  ((count++))
done <dataset_links.txt

cp -r ./ $EPHEMERAL/raw_zipped

now=`date`
echo "End Time: $now"
