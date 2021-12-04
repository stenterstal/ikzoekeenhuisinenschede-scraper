function log(tags: ('error' | 'info' | '.env' | 'scraper' | 'mailer')[], message: string, newLine?: boolean) {
    console.log(
        newLine
            ? '\n'
            : '' +
                  // Dark gray
                  getColorCode('darkgray') +
                  new Date(Date.now()).toISOString() +
                  ' ' +
                  getTags(tags) +
                  ' ' +
                  // Bright white
                  getColorCode('brightwhite') +
                  message +
                  // Reset color
                  getColorCode('reset')
    );
}

function colored(color: string, text: string): string {
    return getColorCode(color) + text + getColorCode('reset');
}

function getTags(tags: string[]) {
    return tags
        .map((tag) => {
            return getTag(tag);
        })
        .join(' ');
}

function getTag(tag: string) {
    switch (tag) {
        case 'error':
            return getColorCode('red') + 'ERROR' + getColorCode('white');
        case 'info':
            return getColorCode('green') + 'INFO' + getColorCode('white');
        case '.env':
            return getColorCode('magenta') + '.ENV' + getColorCode('white');
        case 'scraper':
            return getColorCode('yellow') + 'SCRAPER' + getColorCode('white');
        case 'mailer':
            return getColorCode('brightblue') + 'MAILER' + getColorCode('white');
    }
}

function getColorCode(color: string): string {
    switch (color) {
        case 'red':
            return '\x1b[31m';
        case 'brightred':
            return '\x1b[91m';
        case 'white':
            return '\x1b[37m';
        case 'brightwhite':
            return '\x1b[97m';
        case 'darkgray':
            return '\x1b[90m';
        case 'green':
            return '\x1b[32m';
        case 'brightgreen':
            return '\x1b[92m';
        case 'magenta':
            return '\x1b[35m';
        case 'yellow':
            return '\x1b[33m';
        case 'brightyellow':
            return '\x1b[93m';
        case 'brightblue':
            return '\x1b[94m';
        case 'reset':
        default:
            // Reset
            return '\x1b[0m';
    }
}

export { log, colored };
