#PBS -lwalltime=04:00:00
#PBS -l select=1:ncpus=4:mem=16gb

now=`date`
echo "Start Time: $now"

mkdir $EPHEMERAL/raw_unzipped
cp -r $EPHEMERAL/raw_zipped $EPHEMERAL/raw_unzipped

cd $EPHEMERAL/raw_unzipped

gunzip -r ./

rm *.gz

now=`date`
echo "End Time: $now"
