const { hashPassword } = require('../utils/passwordHash')

if (!process.stdin.isTTY) {
    console.error('Run this command in an interactive terminal: npm run hash-admin-password')
    process.exit(1)
}

process.stdout.write('Enter a new administrator password (minimum 12 characters; input is masked): ')
process.stdin.setRawMode(true)
process.stdin.setEncoding('utf8')
process.stdin.resume()

let password = ''

process.stdin.on('data', (chunk) => {
    for (const character of chunk) {
        if (character === '\u0003') {
            process.stdout.write('\nCancelled.\n')
            process.exit(1)
        }
        if (character === '\r' || character === '\n') {
            process.stdin.setRawMode(false)
            process.stdin.pause()
            process.stdout.write('\n')

            if (password.length < 12) {
                console.error('Password must contain at least 12 characters.')
                process.exit(1)
            }

            const passwordHash = hashPassword(password)
            password = ''
            console.log('\nAdd this value to your backend environment as ADMIN_PASSWORD_HASH:')
            console.log(passwordHash)
            console.log('\nKeep this hash private. Do not commit it to a public repository.')
            process.exit(0)
        }
        if (character === '\u007f' || character === '\b') {
            if (password.length > 0) {
                password = password.slice(0, -1)
                process.stdout.write('\b \b')
            }
        } else if (character >= ' ') {
            password += character
            process.stdout.write('*')
        }
    }
})
