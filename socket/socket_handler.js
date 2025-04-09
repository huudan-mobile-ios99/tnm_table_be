const cron = require('node-cron');
const dboperation_socketio = require('./socket_operation');
//setting using mysqloperation
const dboperation_mysql = require('../mysql/mysql_operation');
//time api using mongodb operation
const dboperation_time = require('../mongodb/mongo_operation.time');
//time function
const dboperation_time_function = require('../mongodb/mongo_function.time');
//jackpot function
const dboperation_jackpot_function = require('../mongodb/mongo_function.jackpot');

const dboperation_jackpot_drop_function = require('../mongodb/mongo_function.jackpot_drop');

const dboperation_device_function = require('../mongodb/mongo_function_device')
const dboperation_setting_function = require('../mongodb/mongo_function.setting')

const apiSettings = {
    topRakingLimit: 10,
    realtimeLimit: 8,
    init:false
};



let jackpotSettings = {
    returnValue: 50,  // Default value
    oldValue: 50,     // Default value
    defaultThreshold: 75,
    limit: 100,
    percent: 0.05,
    throttleInterval: 7, // 7 seconds interval between each run
    selectedIp : null,
}

let jackpot2Settings = {
    returnValue: 20,  // Default value
    oldValue: 20,     // Default value
    defaultThreshold: 55,
    limit: 70,
    percent: 0.001,
    throttleInterval: 7, // 6 seconds interval between each run
    selectedIp: null,
}

let cronJobRunning = false; // Flag to check if cronJob2 is running
let cronJob2; // Define cronJob2 (vegas prize) globally


let cronJobRunningsub = false; // Flag to check if cronJob3 is running
let cronJob3; // Define cronJob3 (lucky prize) globally





function handleSocketIO(io) {
    apiSettings.init=false;
    io.off('connection',(socket)=>{
        console.log('off connection');
    });
    function startCronJob2(forceRestart = false,) {
        if (forceRestart && cronJob2) {
            console.log('Force restarting cronJob2...');
            cronJob2.stop();
            cronJobRunning = false;
        }

        if (cronJob2 && cronJobRunning) {
            console.log('cronJob2 is already running.');
            return;
        }

        console.log('Starting cronJob2 Vegas prize(7s)');
        cronJob2 = cron.schedule('*/7 * * * * *', () => {
            console.log(`Running cronJob2 ${jackpotSettings.selectedIp} ${jackpotSettings.percent} max:${jackpotSettings.limit} threshold: ${jackpotSettings.defaultThreshold} `);
            dboperation_jackpot_function.findJackpotNumberSocket(
                'eventJackpotNumber',
                io,
                false,
                jackpotSettings,
                jackpot2Settings.selectedIp,
                cronJob2
            );
        });

        cronJobRunning = true; // Set flag to indicate running status
    }



    io.on('connection', (socket) => {
            console.log('A user connected', socket.id);
            dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            dboperation_socketio.findListDisplaySocket('eventFromServerToggle', io);

            const cronJob = cron.schedule('*/5 * * * * *', () => {
                dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            });
            // const cronJobJPDrop = cron.schedule('*/2 * * * * *', () => {
            //     dboperation_jackpot_drop_function.findLatestJackpotDropSocket('eventJPDrop', io, );
            // });

            // startCronJob2();


            socket.on('eventFromClient2_force', (data) => {
                dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, true, apiSettings.topRakingLimit);
            });




            socket.on('eventFromClient_force', (data) => {
                dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
             });

            socket.on('changeLimitTopRanking', (newLimit) => {
                console.log(`Received new limit TOPRANKING from UI: ${newLimit}`);
                apiSettings.topRakingLimit = newLimit;
                console.log(`Updated findListRankingSocketLimit to: ${apiSettings.topRakingLimit}`);
            });
            socket.on('changeLimitRealTimeRanking', (newLimit) => {
                console.log(`Received new limit REALTIME from UI: ${newLimit}`);
                apiSettings.realtimeLimit = newLimit;
                console.log(`Updated changeLimitRealTimeRanking to: ${apiSettings.realtimeLimit}`);
            });

            socket.on('eventFromClientDelete', (data) => {
                const stationIdToDelete = data.stationId;
                dboperation_socketio.deleteStationDataSocketWName('eventFromServer', io, stationIdToDelete);
                dboperation_socketio.findStationDataSocketWName('eventFromServer', io);
            });
            socket.on('eventFromClientAdd', (data) => {
                const { machine, member, bet, credit, connect, status, aft, lastupdate } = data;
                dboperation_socketio.addStationDataSocketWName('eventFromServer', io, machine, member, bet, credit, connect, status, aft, lastupdate);
                dboperation_socketio.findStationDataSocketWName('eventFromServer', io);
            });

            //EVENT DEVICE
            socket.on('emitDevice', (data) => {
                console.log('eventDevice access ')
                dboperation_device_function.listDevices('eventDevice', io, );
            });


            //TOGGLE EVENT FROM CLIENT
            socket.on('emitToggleDisplay', (data) => {
                dboperation_socketio.findListDisplaySocket('eventFromServerToggle', io);
            });
            //TOGGLE EVENT FROM CLIENT
            socket.on('emitToggleDisplayRealTop', (data) => {
                dboperation_socketio.findListDisplayRealTopSocket('eventFromServerToggle', io);
            });

            //emitTime Socket
            socket.on('emitTime', async () => {
                console.log('emitTime acess');
                dboperation_time_function.findTimeFirstSocket('eventTime',io);
            });

            // Handle getting settings from mongodb
            socket.on('emitSetting', async () => {
                console.log('emitSetting acess');
                dboperation_setting_function.findSettingSocketMongo('eventSetting',io);
            });
            //updateTime Socket
            socket.on('updateTime', async (updateData) => {
                console.log('Update Time access without ID');
                dboperation_time_function.updateTimeByIdSocket('eventTime', io, updateData);
            });

            //jackpot socket from mongodb
            socket.on('emitJackpot', async () => {
                console.log('jackpot acess');
                dboperation_jackpot_function.findJackpotPriceSocket('eventJackpot',io);
            });
            //jackpot drop to display and notify when drop socket from mongodb
            socket.on('emitJPDrop', async () => {
                console.log('emitJPDrop acess');
                dboperation_jackpot_drop_function.findLatestJackpotDropSocket('eventJPDrop', io, );
            });


            //jackot socket from mysql
            socket.on('emitJackpotNumber', async () => {
                console.log('vegas prize. jackpot acess number');
                dboperation_jackpot_function.findJackpotNumberSocket('eventJackpotNumber',io,false,jackpotSettings);
            });
            //jackot socket from mysql
            socket.on('emitJackpot2Number', async () => {
                // console.log('lucky prize. jackpot acess number');
                // dboperation_jackpot_function2.findJackpot2NumberSocket('eventJackpot2Number',io,false,jackpot2Settings);
            });

            //jackot socket from mysql
            socket.on('emitJackpotNumberInitial', async () => {
                console.log('jackpot acess number initial');
                startCronJob2(true);
                dboperation_jackpot_function.findJackpotNumberSocket('eventJackpotNumber',io,true,jackpotSettings);
            });
            //jackot 2  socket from mysql
            socket.on('emitJackpot2NumberInitial', async () => {
                // console.log('jackpot 2 acess number initial');
                // dboperation_jackpot_function2.findJackpot2NumberSocket('eventJackpot2Number',io,true,jackpot2Settings);
            });
            // Listen for 'updateJackpotSettings'
            socket.on('updateJackpotSetting', (newSettings) => {
                console.log('Received jackpot settings from Flutter:', newSettings);
                // Update the current jackpot settings with the new ones received from Flutter
                jackpotSettings = {
                    ...jackpotSettings,  // Spread operator to maintain the structure and overwrite specific fields
                    ...newSettings       // Overwriting only the provided new settings
                };
                console.log('Updated jackpot settings:', jackpotSettings);
                // Optionally, emit an event back to Flutter or other clients to confirm the update
            });

            // Listen for 'updateJackpot2Settings'
            socket.on('updateJackpot2Setting', (newSettings) => {
                // console.log('Received jackpot2 settings from Flutter:', newSettings);
                jackpot2Settings = {
                    ...jackpot2Settings,  // Spread operator to maintain the structure and overwrite specific fields
                    ...newSettings       // Overwriting only the provided new settings
                };
                console.log('Updated jackpot2 settings:', jackpot2Settings);
                io.emit('jackpot2SettingsUpdated', jackpot2Settings);
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
                cronJob.stop();
                // cronJobJPDrop.stop();
                if (io.engine.clientsCount === 0 && cronJobRunning) {
                    console.log('Stopping cronJob2...');
                    cronJob2.stop();
                    cronJobRunning = false; // Reset the flag when stopping cronJob2
                }
                if (io.engine.clientsCount === 0 && cronJobRunningsub) {
                    console.log('Stopping cronJob3...');
                    cronJob3.stop();
                    cronJobRunningsub = false; // Reset the flag when stopping cronJob3
                }
                apiSettings.init=false;
            });
        });
}

module.exports = {
    handleSocketIO,
    jackpotSettings,
    jackpot2Settings,
};

