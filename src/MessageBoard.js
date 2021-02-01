import React from 'react'

  // function Message(author,message) {
  //   this.author = author
  //   this.message = message
  // }

 class MessageBoard extends React.Component {

    static Messages = ["beginning message"]


    render() {
      const status = '' ;//'Next player: X';
  
      return (
        <div style={{padding: "20px"}}>
          <div className="status">{status}</div>
          {MessageBoard.Messages.length}
          {MessageBoard.Messages.map(message => (
            <li key={message}>{message}</li>
          ))}
        </div>
      );
    }
  }

  export default MessageBoard;