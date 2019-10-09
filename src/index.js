import React from 'react';
import ReactDOM from 'react-dom';
import thunks from 'redux-thunk';
import { HashRouter, Link, Route } from 'react-router-dom';
import { Provider, connect } from 'react-redux';

import store,{ getAuth, getNotes, createNote, destroyNote } from './store';

const { render } = ReactDOM;
const { Component } = React;

class _Create extends Component{
  constructor(){
    super();
    this.state = {
      text: '',
      error: ''
    };
    this.create = this.create.bind(this);
  }
  async create(){
    try {
      await this.props.create(this.state)
    }
    catch(ex){
      this.setState({ error: ex.response.data.message });
    }
  }
  render(){
    const { text, error } = this.state;
    return (
      <div>
        { error && <div className='error'>{ error}</div> }
        <input value={ text } onChange={(ev)=> this.setState({ text: ev.target.value})} />
        <button disabled={ !text} onClick={ this.create }>Create Note</button>
      </div>
    );
  }
}

const Create = connect(null, (dispatch)=> {
  return {
    create: (note)=> dispatch(createNote(note))
  };
})(_Create);

const _Nav = ({ auth, notes })=> {
  return (
    <div>
      <nav>
        <Link to='/notes'>Notes ({ notes.length })</Link>
        <Link to='/notes/create'>Create</Link>
      </nav>
      <h1>Welcome { auth.fullName }</h1>
    </div>
  );
};

const Nav = connect(
  ({ auth, notes })=> {
    return {
      auth,
      notes
    };
  }
)(_Nav);

const _Notes = ({ notes, destroy })=> {
  return (
    <ul>
      {
        notes.map( note => {
          return (
            <li key={ note.id }>{ note.text } <button onClick={ ()=> destroy(note)}>x</button></li>
          );
        })
      }
    </ul>
  );
}

const Notes = connect((state)=> state, (dispatch)=> {
  return {
    destroy: (note)=> dispatch(destroyNote(note))
  }
})(_Notes); 

class _App extends Component{
  componentDidMount(){
    this.props.fetchUser()
  }
  render(){
    return (
      <HashRouter>
        <Route component={ Nav } />
        <Route path='/notes' component={ Notes } />
        <Route path='/notes/create' component={ Create } />
      </HashRouter>
    );
  }
}

const App = connect(({ auth })=> {
  return {
    auth
  };
}, (dispatch)=> {
  return {
    fetchUser: ()=> dispatch(getAuth())
  };
})(_App);

const root = document.querySelector('#root');
render(<Provider store={ store }><App /></Provider>, root);

