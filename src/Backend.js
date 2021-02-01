import React, { useEffect, useState }  from 'react';


const Backend = () => {

    let [bids, setBids] = useState([]);



    function randomBid() {
        var rando = Math.random();
        setBids(...setBids, rando)
        console.log("added random bid")
    }
}

export default Backend
