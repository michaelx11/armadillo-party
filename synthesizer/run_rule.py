import random, sys

def genFileName():
    uniq =  ''.join(random.choice('0123456789ABCDEF') for i in range(10))
    return "sketch" + uniq

# Name of the .cpp and .h files in the sketch_output directory
code_name = sys.argv[1]

lines = []
f = open('sketch_output/%s.cpp')
for line in f:
    line.append(line)
f.close()


tests = []
num_tests = input()

for i in range(num_cases):
    line = raw_input()
    split = line.split(' ')
    tests.append((split[0].strip().lower(), split[1].strip().lower()))

def testToAssert(test, index):
    ints = map(lambda x: str(ord(x) - ord('a')), list(test[0]))
    arr_string = 'int test%d[%d] = '
    arr_string = '{' + ints[0]
    for i in ints[1:]:
        arr_string += ", " + i
    arr_string += '};\n'
    if test[1].lower() == 'yes':
        return "assert(rule(%s, %d));" % (arr_string, len(test[0]))
    return "assert(!rule(%s, %d));" % (arr_string, len(test[0]))

compile_command = 'g++ -o sketch_output/%s -I $SKETCH_HOME/include sketch_output/%s.cpp' % (code_name, code_name)
