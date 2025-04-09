
const Settings  =  require('./model/setting')

 async function findSettingSocketMongo(eventName,io){
  try {
    const myData = await Settings.find();
    if (!myData) { console.log('findSettingSocket: No Data');    }
    io.emit(eventName, myData);
  } catch (err) {
    console.error(err);
    console.log('findSettingSocket: An Error Orcur');
    throw new Error('Error updating time record: ' + error.message);
  }
}

module.exports = {
  findSettingSocketMongo:findSettingSocketMongo,
};
