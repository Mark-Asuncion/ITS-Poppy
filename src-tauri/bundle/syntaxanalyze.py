import tokenize
import keyword
import sys
from io import BytesIO

def analyze_line(line):
    tokens = tokenize.tokenize(BytesIO(line.encode('utf-8')).readline)
    token_info = []

    ignore_types = ["ENCODING", "NEWLINE", "DEDENT"];

    for token in tokens:
        if token.type != tokenize.ENDMARKER:  # Ignore end markers
            token_type = tokenize.tok_name[token.type]
            if (token_type in ignore_types):
                continue

            token_string = token.string
            start_position = token.start[1]  # Column index where the token starts
            token_length = len(token_string)  # Length of the token

            if token_type == "STRING":
                token_string = token_string.replace("\"", "\\\"")

            is_keyword = token_string in keyword.kwlist
            if is_keyword == True:
                is_keyword = "true"
            else:
                is_keyword = "false"
            token_info.append({
                "tokenType": token_type,
                "value": token_string,
                "index": start_position,
                "len": token_length,
                "keyword": is_keyword
            })
    return token_info

if len(sys.argv) == 0:
    print("[]");
    exit(0)

arg = sys.argv[1]
try:
    out = analyze_line(arg);
    p = "["
    i = 0
    for item in out:
        if i > 0:
            p+= ","
        p += "{"
        p += f'"tokenType": "{item["tokenType"]}",'
        p += f'"value": "{item["value"]}",'
        p += f'"index": {item["index"]},'
        p += f'"len": {item["len"]},'
        p += f'"keyword": {item["keyword"]}'
        p += "}"
        i+=1
    p += "]";
    print(p)
except:
    print("[]")
