//jshint esversion:6

//module.exports is an object, It has methods. So, we can write lots of function inside.

exports.getDate = () => {
    const today = new Date();

    const options = {
        weekday:'long',
        month: 'long',
        day: 'numeric',
    };
    
    return today.toLocaleDateString('en-US',options);
}

exports.getDay = () => {
    const today = new Date();

    const options = {
        weekday:'long',
    };
    
    return today.toLocaleDateString('en-US',options);
}

