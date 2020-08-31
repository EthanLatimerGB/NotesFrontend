import React, { useState, useEffect, useRef } from 'react'
import Note from './components/Note'
import services from './components/services'
import loginService from './components/Login'
import LoginForm from './components/loginForm'
import Toggleable from './components/toggleableComp'
import NoteForm from './components/noteForm'

const App = (props) => {
    const [notes, setNotes] = useState([])
    const [newNote, setNewNote] = useState('a new note...')
    const [showAll, setShowAll] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [loginVisible, setLoginVisible] = useState(false)

    useEffect(() => {
        services
            .getAll()
            .then(response => setNotes(response)) 
    }, [])

    useEffect(() => {
        const loggeUserJSON = window.localStorage.getItem('loggedNoteappUser')
        if(loggeUserJSON){
            const user = JSON.parse(loggeUserJSON)
            setUser(user)
            services.setToken(user.token)
        }
    }, [])

    const noteFormRef = useRef()

    console.log('render', notes.length, 'notes')

    const toggleImportanceOf = (id) => {
        const note = notes.find(n => n.id === id)
        const changedNote = { ...note, important: !note.important}

        services.update(id, changedNote).then(response => {
            setNotes(notes.map(note => note.id !== id ? note : response))
        }).catch(error => {
            setErrorMessage(
                `Note '${note.content}' was already removed from server`
            )
            setTimeout(()=> {
                setErrorMessage(null)
            }, 5000)
        })
    }

    const addNote = (noteObject) => {
        noteFormRef.current.toggleVisibility()
        services
            .create(noteObject)
            .then(returnedNote => {
                setNotes(notes.concat(returnedNote))
            })
    }

    const handleLogin = async (event) => {
        event.preventDefault()
        try {
            const user = await loginService.login({
                username, password
            })

            window.localStorage.setItem(
                'loggedNoteappUser', JSON.stringify(user)
            )

            services.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        }
        catch(exception){
            setErrorMessage(('Wrong credentials'))
            setTimeout(()=> {
                setErrorMessage(null)
            }, 5000)
        }

    }

    const notesToShow = showAll ? notes 
        : notes.filter(note => note.important)

    const Notification = ({message}) => {
        if(message === null){
            return null
        }
        return(
            <div className="error">
                {message}
            </div>
        )
    }

    const Footer = () => {
        const footerStyle = {
            color: 'green',
            fontStyle: 'italic',
            fontSize: 16
        }

        return(
            <div style={footerStyle}>
                <br/>
                <em>Note application</em>
            </div>
        )
    }

    const loginForm = () => {
        const hideWhenVisible = { display: loginVisible ? 'none' : ''}
        const showWhenVisible = { display: loginVisible ? '' : 'none'}

        return(
            <div>
                <div style = {hideWhenVisible}>
                    <button onClick = {() => setLoginVisible(true)}>Login</button>
                </div>

                <div style = {showWhenVisible}>
                    <LoginForm
                        username = {username}
                        password = {password}
                        handleUsernameChange = {({target}) => setUsername(target.value)}
                        handlePasswordChange = {({target}) => setPassword(target.value)}
                        handleSubmit = {handleLogin} 
                    />
                    <button onClick = {() => setLoginVisible(false)}>Cancel</button>
                </div>
            </div>
        )
    }


    const noteForm = () => (
        <Toggleable buttonLabel = 'new Note' ref={noteFormRef}>
            <NoteForm createNote={addNote}/>
        </Toggleable>
    )

    return(
        <div>
            <h1>Notes</h1>
            <Notification message ={errorMessage}/>
            
            {loginForm()}

            <ul>
                {notesToShow.map(note => <Note key={note.id} note={note} toggleImportance={()=> toggleImportanceOf(note.id)}/>)}
            </ul>

            {noteForm()}

            <button onClick={() => setShowAll(!showAll)}>
                show {showAll ? 'important' : 'all'}
            </button>

            <Footer/>

        </div>
    )
}

export default App