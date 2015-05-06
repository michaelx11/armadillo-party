import random, sys, shutil, os

def genFileName():
    uniq =  ''.join(random.choice('0123456789ABCDEF') for i in range(10))
    return "sketch" + uniq

# Name of the .cpp and .h files in the sketch_output directory
code_name = sys.argv[1]

lines = []
f = open('sketch_output/%s.cpp' % code_name)
for line in f:
    lines.append(line)
f.close()


tests = []
num_tests = input()

for i in range(num_tests):
    line = raw_input()
    split = line.split(' ')
    tests.append((split[0].strip().lower(), split[1].strip().lower()))

def testToAssert(test, index):
    ints = map(lambda x: str(ord(x) - ord('a')), list(test[0]))
    arr_string = '\n\n  // WORD: %s' % test[0]
    arr_string += '\n  bool bool%d = true;\n' % index
    arr_string += '  int test%d[%d] = ' % (index, len(test[0]))
    arr_string += '  {' + ints[0]
    for i in ints[1:]:
        arr_string += ", " + i
    arr_string += '};\n'
    arr_string += '  ANONYMOUS::rule(test%d, %d, bool%d);\n' % (index, len(test[0]), index)
    desired = 'true' if test[1].lower() == 'yes' else 'false'
    arr_string += '  result = result && (bool%d == %s);' % (index, desired)
    return arr_string

lines.append('\nint main() {\n  bool result = true;\n')

for i, test in enumerate(tests):
    lines.append(testToAssert(test, i))

lines.append('\n\n  if (result) {\n    printf("TESTS PASSED\\n");\n  } else {\n    printf("TESTS FAILED\\n");\n  }\n}')

f = open('rule_programs/%s.cpp' % code_name, 'w')
for line in lines:
    f.write(line)
f.close()

shutil.copyfile('sketch_output/%s.h' % code_name, 'rule_programs/%s.h' % code_name)

compile_command = 'g++ -o rule_programs/%s -I $SKETCH_HOME/include rule_programs/%s.cpp' % (code_name, code_name)

os.system(compile_command)
os.system('./rule_programs/%s' % code_name)
