####################################################################################################

__all__ = [
    'SOURCE_PATH',
    'strc',
    'join_cmd',
]

####################################################################################################

from pathlib import Path

try:
    import colorama
    from colorama import Fore, Style
except ImportError:
    colorama = None

####################################################################################################

if colorama:
    colorama.just_fix_windows_console()
    colorama.init(autoreset=True)

####################################################################################################

SOURCE_PATH = Path(__file__).parents[2]

####################################################################################################

def strc(text: str) -> None:
    raw = ''
    start = 0
    color_stack = []
    while True:
        i = text.find('<', start)
        if i == -1:
            raw += text[start:]
            break
        else:
            raw += text[start:i]
            j = text.find('>', i)
            if j == -1:
                raise ValueError(f"missing '>' in '{text}`")
            color = text[i+1:j]
            if color.startswith('/'):
                # Fixme: complete
                color_stack.pop()
                if colorama:
                    raw += Style.RESET_ALL
            else:
                color_stack.append(color)
                if colorama:
                    raw += getattr(Fore, color.upper())
            start = j + 1
    return raw

def printc(text: str) -> None:
    print(strc(text))

####################################################################################################

def join_cmd(cmd: list[str]) -> str:
    return ' '.join(cmd)
