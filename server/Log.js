class Log{
  info(data){
    const timeStamp = new Date();
    console.log(`[${timeStamp.toISOString()}]:\t${data}`);
  }

  error(data){
    const timeStamp = new Date();
    console.error(`[${timeStamp.toISOString()}]:\t${data}`);
  }
}

module.exports = Log;
