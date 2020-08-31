import axios from 'axios'
const baseUrl = '/api/notes'

let token = null

const setToken = newToken => {
    token = `bearer ${newToken}`
}

const getAll = async () => {
    const response = await axios.get(baseUrl)
    const nonExisting = {
        id: 1000,
        content: 'This note is not saved to the server',
        data: '2019-05-30T17:30:31.098Z',
        important: true,
    }
    return response.data.concat(nonExisting)
}

const create = async newObject => {
    const config = {
        headers: {Authorization: token},
    }
    const response = await axios.post(baseUrl, newObject, config)
    return response.data
}

const update = async (id, newObject) => {
    const response = await axios.put(`${baseUrl}/${id}`, newObject)
    return response.data
}

export default{ getAll, create, update, setToken }