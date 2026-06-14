import { sendEmail } from './emailConfig.js'

const test = async () => {
  const result = await sendEmail(
    'maddulalokeshwar5@gmail.com',
    'Test Email',
    '<h1>Working!</h1>'
  )

  console.log(result)
}

test()