import csv
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from collections import defaultdict
from os import listdir
from tabulate import tabulate
import pandas as pd

plt.rcParams.update({'font.size': 11})

columns = defaultdict(list)


def find_csv_filenames(path_to_dir, suffix=".csv"):
    filenames = listdir(path_to_dir)
    return [filename for filename in filenames if filename.endswith(suffix)]


def printStats(allStats, sizes):
    for index, stats in enumerate(allStats):
        joinStats = ' & '.join([str(x) for x in stats])
        print(sizes[index], '&', joinStats, "\\\\ \hline")


def getBoxplots(dirname):
    print('--------', dirname, '--------')
    datadir = f"data/{dirname}"

    allRoundTrip = []
    allOneOnly = []
    allOtherWay = []
    labelx = []

    filenames = find_csv_filenames(datadir)
    filenames = sorted(filenames, key=lambda x: int(x.split('-')[2]))
    for name in filenames:

        columns = pd.read_csv(f"{datadir}/{name}")

        t1 = np.asarray(columns['T1'], dtype=int)
        t2 = np.asarray(columns['T2'], dtype=int)
        t3 = np.asarray(columns['T3'], dtype=int)
        t4 = np.asarray(columns['T4'], dtype=int)

        roundtrip = t4 - t1
        oneonly = t2 - t1
        otherway = t4 - t3

        allRoundTrip.append(roundtrip)
        allOneOnly.append(oneonly)
        allOtherWay.append(otherway)

        labelx.append(int(name.split('-')[2]))

    ylabels = ['T4-T1 (ms)', 'T2-T1 (ms)', 'T4-T3 (ms)']
    sizes = ['5', '10', '50', '100', '500', '1000']
    types = ['roundtrip', 'oneway', 'return']
    for index, vector in enumerate([allRoundTrip, allOneOnly, allOtherWay]):
        allStats = []
        for item in vector:
            std = np.std(np.asarray(item))
            mean = np.mean(np.asarray(item))
            max = np.amax(np.asarray(item))
            min = np.amin(np.asarray(item))
            median = np.median(np.asarray(item))
            allStats.append([mean, std, median, min, max])
        print(types[index])
        printStats(allStats, sizes)

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
getBoxplots('results-mqtt-brasil')
getBoxplots('results-ws-italia')
getBoxplots('results-mqtt-italia')

# getBoxplots('mqtt')
