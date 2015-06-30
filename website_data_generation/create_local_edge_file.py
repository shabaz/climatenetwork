from scipy.io import loadmat
import pickle
import struct


for window in xrange(12):
    filename = "local_distances."+str(window)+".mat"
    x = loadmat(filename)
    x = x['local_distances']
    f = open("edges."+str(window)+".txt", "w")

    g = open("edges."+str(window)+".bin", "wb")


    numsSoFar = {}

    count = 0
    for i in xrange(x.shape[0]):
        for j in xrange(x.shape[1]):
            if i > j:
                continue
            if x[i,j]:
                if not i in numsSoFar:
                    numsSoFar[i] = len(numsSoFar)
                if not j in numsSoFar:
                    numsSoFar[j] = len(numsSoFar)

                f.write(str(numsSoFar[i]) + " " + str(numsSoFar[j]) + " " + str(1.0/x[i,j]) + "\n")
                g.write(struct.pack("fff", i, j, 1.0/x[i,j]))
                count += 1
    print count
    pickle.dump(numsSoFar, open("edges_map."+str(window)+".pickle", "wb"))

