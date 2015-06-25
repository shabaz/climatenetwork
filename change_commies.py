max_len = 0
with open('communities.txt', 'r') as f:
    f.readline()
    while True:
        line = f.readline()
        if not line:
            break
        line_len = len(line.split()) - 3
        if line_len > max_len:
            max_len=line_len

with open('communities.txt', 'r') as f:
    f.readline()
    while True:
        line = f.readline()
        if not line:
            break
        line = line.rstrip('\n')
        line = line.split()[3:]
        line[0] = line[0].lstrip('{')
        line[-1] = line[-1].rstrip('}')

        for i in range(len(line), max_len):
            line.append(',0')
        print(''.join(line).replace(',',' '))
