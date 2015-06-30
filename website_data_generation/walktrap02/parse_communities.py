import os
import pickle
import struct

for window in xrange(12):
    os.system("./walktrap edges."+str(window)+".txt -o communities."+str(window)+".txt -b")


communities_over_time = []



for window in xrange(12):
    accepted_verts = 0
    skipped_verts = 0
    f = open("communities."+str(window)+".txt")

    communities = []
    skip = True

    for line in f.readlines():
        if skip:
            if "modularity" in line:
                skip = False
            continue
        nums = [int(i) for i in line[:-2].split("{")[1].split(',')]
        if len(nums) > 20:
            accepted_verts += len(nums)
            communities.append(nums)
        else:
            skipped_verts += len(nums)
    print "at time " + str(window) + " there were " + str(accepted_verts) + " vertices accepted and " + str(skipped_verts) + " vertices rejected"

    numsMap = pickle.load(open("edges_map."+str(window)+".pickle", "rb"))
    reverseMap = {}
    for k in numsMap:
        reverseMap[numsMap[k]] = k

    new_communities = []
    for community in communities:
        new_communities.append([reverseMap[i] for i in community])

    communities_over_time.append(new_communities)
    #print len(communities)
    #print sum([len(i) for i in communities])

print



groups = []


def find_highest_intersection(community, other_communities):
    highest_overlap = 0
    overlap_community = None
    for next_community in other_communities:
        intersection = set(community).intersection(next_community)
        if len(intersection) > highest_overlap:
            highest_overlap = len(intersection)
            overlap_community = next_community
    return highest_overlap, overlap_community


def sufficient_overlap(highest_overlap, community, overlap_community):
        return float(highest_overlap)/len(community) > 0.5 and float(highest_overlap)/len(overlap_community) > 0.5

def append_to_existing_group(community, next_community, groups):
    for group in groups:
        if community in group:
            group.append(next_community)
            return True
    return False

for period in xrange(12-1):
    count = 0
    for community in communities_over_time[period]:
        highest_overlap, overlap_community = find_highest_intersection(community, communities_over_time[period+1])
        if sufficient_overlap(highest_overlap, community, overlap_community):
            if not append_to_existing_group(community, overlap_community, groups):
                groups.append([[]]*period+[community, overlap_community])
            count+= 1
        else:
            groups.append([[]]*period+[community])

    print "in period " + str(period) + " there were " + str(count) +" groups"


print len(groups)
for group in groups:
    print len(group)
    group += [[]]*(12-len(group))



f = open("communities_over_time.bin", "wb")
print 
for period in xrange(12):
    vals = [0]*10512
    a = [i[period] for i in groups]
    for nr, group in enumerate([i[period] for i in groups], start=1):
        for groupmember in group:
            vals[groupmember] = nr
    for val in vals:
        f.write(struct.pack('i', val))
f.close() 


#f = open("communities_over_time.bin", "wb")
#for communities_at_time in communities_over_time:
#    vals = [0]*10512
#
#
#    for nr, community in enumerate(communities_at_time, start=1):
#        for position in community:
#            vals[position] = nr
#
#    for val in vals:
#        f.write(struct.pack('i', val))
#f.close()
#pickle.dump(communities_over_time, open("communities_over_time.pickle", "wb"))
