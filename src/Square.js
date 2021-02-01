import React from 'react'
import MessageBoard from './MessageBoard'


export class Square extends React.Component {
  render() {
      var val = this.props.value
    return (
      <button className="square" style={{padding: "20px", fontSize: "20px", minWidth: "150px"} } onClick={function(){console.log(val + " pressed"); MessageBoard.Messages.push(val + " pressed"); }}>
        {this.props.value}
      </button>
    );
  }
}


export default Square;