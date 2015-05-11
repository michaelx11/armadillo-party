import sys, os, shutil

if len(sys.argv) < 2:
    sys.stderr.write("Error! no file path")

code_name = sys.argv[1]

isRule = False
f = open('rule_programs/%s.cpp' % code_name, 'r')
for line in f:
    if 'void rule(' in line:
        isRule = True
    if 'void isVowel(' in line or 'int main(' in line:
        isRule = False
    if isRule:
        sys.stdout.write(line.rstrip() + '--NEWLINE--')
f.close()
