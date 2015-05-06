# Run sketch with a set of test cases
import sys, os, shutil

if len(sys.argv) < 2:
    sys.stderr.write("Error! no file path")

code_name = sys.argv[1]

lines = []
f = open('synthesizer/checker_v2.sk', 'r')
for line in f:
    lines.append(line)
f.close()

num_cases = input()
cases = [] # Tuple (word, yes/no)

for i in range(num_cases):
    line = raw_input()
    split = line.split(' ')
    cases.append((split[0].strip().lower(), split[1].strip().lower()))

def caseToAssert(case):
    ints = map(lambda x: str(ord(x) - ord('a')), list(case[0]))
    arr_string = '{' + ints[0]
    for i in ints[1:]:
        arr_string += ", " + i
    arr_string += '}'
    if case[1].lower() == 'yes':
        return "assert(rule(%s, %d));" % (arr_string, len(case[0]))
    return "assert(!rule(%s, %d));" % (arr_string, len(case[0]))

lines.append("\n\n// Auto-Generated Harness\n\n")
lines.append("\n\n// Auto-Generated Harness\n\n")
lines.append("harness void test() {\n// Auto-Generated Assertions")
for case in cases:
    lines.append("\n" + caseToAssert(case));

lines.append("\n}")

f = open('sketches/%s.sk' % code_name, 'w')
for line in lines:
    f.write(line)
f.close()

os.system('sketch --fe-output-code sketches/%s.sk' % code_name)
shutil.move('%s.cpp' % code_name, 'sketch_output/%s.cpp' % code_name)
shutil.move('%s.h' % code_name, 'sketch_output/%s.h' % code_name)
