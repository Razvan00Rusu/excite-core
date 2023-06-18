#PBS -lwalltime=06:00:00
#PBS -l select=1:ncpus=4:mem=100gb

module purge
module load tools/prod
module load anaconda3/personal
source activate ten

now=`date`
echo "Start Time: $now"

python $HOME/data_aggregation/dataset_visualisation.py $EPHEMERAL/raw_unzipped/data.csv $HOME/oh-my-papers/data/citation.csv $HOME/data_visualisation/fig.png

now=`date`
echo "End Time: $now"
