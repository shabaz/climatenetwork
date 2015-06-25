with open('communities.txt', 'r') as f:
    f.readline()
    while True:
        line = f.readline()
        if not line:
            break
        line = line.rstrip('\n')
        print(''.join(line.split()[3:]).rstrip('}').lstrip('{').replace(',',' '))
