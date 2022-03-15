import https from 'https'

export const httpRequest = async (
	url: string,
	method = 'GET'
): Promise<string> => {
	const options = {
		hostname: 'ps.pndsn.com',
		port: 443,
		path: url,
		method: method,
	}
	return new Promise((resolve, error) => {
		const req = https.request(options, (res) => {
			if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
				return error(new Error(`response code: ${res.statusCode}`))
			}

			const data: Buffer[] = []

			res.on('data', (d) => {
				data.push(d)
			})

			res.on('end', () => resolve(`${Buffer.concat(data)}`))
		})

		req.on('error', error)

		req.end()
	})
}
