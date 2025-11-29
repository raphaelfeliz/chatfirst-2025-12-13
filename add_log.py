import sys
import datetime
import os

def log_action(message):
    log_file = "chat_nov28_log.md"
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"## {timestamp}\n{message}\n\n"
    
    with open(log_file, "a", encoding='utf-8') as f:
        f.write(entry)
    print(f"Logged to {log_file}: {message}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        log_action(" ".join(sys.argv[1:]))
    else:
        print("Usage: python add_log.py 'message'")
