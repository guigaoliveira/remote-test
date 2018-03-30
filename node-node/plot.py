import csv
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from collections import defaultdict
from os import listdir
from tabulate import tabulate

plt.rcParams.update({'font.size': 11})

columns = defaultdict(list)


def find_csv_filenames(path_to_dir, suffix=".csv"):
    filenames = listdir(path_to_dir)
    return [filename for filename in filenames if filename.endswith(suffix)]


def getBoxplots(dirname):
    print('--------', dirname, '--------')
    datadir = f"data/{dirname}"

    allRoundTrip = []
    allOneOnly = []
    allOtherWay = []
    labelx = []

    filenames = find_csv_filenames(datadir)
    for name in filenames:

        with open(f"{datadir}/{name}", 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                for (k, v) in row.items():
                    columns[k].append(v)

        t1 = np.asarray(columns['T1 (ms)'], dtype=int)
        t2 = np.asarray(columns['T2 (ms)'], dtype=int)
        t3 = np.asarray(columns['T3 (ms)'], dtype=int)
        t4 = np.asarray(columns['T4 (ms)'], dtype=int)

        roundtrip = np.subtract(t4, t1)
        oneonly = np.subtract(t2, t1)
        otherway = np.subtract(t4, t3)

        allRoundTrip.append(roundtrip)
        allOneOnly.append(oneonly)
        allOtherWay.append(otherway)

        labelx.append(int(name.split('-')[2]))

    ylabels = ['T4-T1 (ms)', 'T2-T1 (ms)', 'T4-T3 (ms)']

    for index, vector in enumerate([allRoundTrip, allOneOnly, allOtherWay]):
        allStats = []
        for item in vector:
            std = np.std(np.asarray(item))
            mean = np.mean(np.asarray(item))
            max = np.amax(np.asarray(item))
            min = np.amin(np.asarray(item))
            median = np.median(np.asarray(item))
            allStats.append([mean, std, median, min, max])
        print(index, tabulate(allStats, tablefmt="latex", floatfmt=".2f"))

    for index, item in enumerate([allRoundTrip, allOneOnly, allOtherWay]):
        labelx = np.sort(labelx)
        plt.ylabel(ylabels[index])
        plt.xlabel('Payload size (bytes)')
        plt.boxplot(item, 0, '')
        plt.xticks(np.arange(1, len(labelx) + 1), labelx)
        sns.despine()
        plt.savefig(f"box-plots/{dirname}-{name.split('-')[1]}-{index}.png",
                    bbox_inches='tight', pad_inches=0.09)
        plt.clf()


getBoxplots('results-ws-brasil')
getBoxplots('results-ws-italia')
getBoxplots('results-mqtt-brasil')
getBoxplots('results-mqtt-italia')

# getBoxplots('mqtt')
