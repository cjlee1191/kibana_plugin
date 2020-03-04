import React from 'react'

function Error(props){
    const error = props.error
    return(
    console.error(error)
    )
}

export default Error