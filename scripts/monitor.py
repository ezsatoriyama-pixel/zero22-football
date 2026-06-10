import json, subprocess, sys, os

QUEUE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'activation-queue.json')
QWENPAW = r'D:\QwenPaw\Scripts\qwenpaw.exe'

def main():
    if not os.path.exists(QUEUE_PATH):
        print('NONE')
        return

    with open(QUEUE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    pending = data.get('pending', [])
    new_items = [i for i in pending if not i.get('notified', False)]

    if not new_items:
        print('NONE')
        return

    for item in new_items:
        phone = item['phone']
        masked = item['maskedPhone']
        msg = f"\U0001F4E9 New Pro: {masked}, paid 29.9? Reply agree {phone} to activate"
        
        cmd = [
            QWENPAW, 'channels', 'send',
            '--agent-id', 'default',
            '--channel', 'console',
            '--target-user', 'default',
            '--target-session', '1781008020204',
            '--text', msg,
        ]
        try:
            subprocess.run(cmd, check=True, timeout=15)
            print('SENT:' + phone)
        except Exception as e:
            print('FAIL:' + phone + ':' + str(e), file=sys.stderr)

        item['notified'] = True
        data.setdefault('notified', []).append(item['id'])

    with open(QUEUE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    main()
