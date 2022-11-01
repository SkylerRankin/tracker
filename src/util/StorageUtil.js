import * as FileSystem from 'expo-file-system';
import { saveFileVersion } from '../pages/Constants';

const storageDirectory = `${FileSystem.documentDirectory}tracker_local_storage/`;
const saveFileName = "save.json";
const maxSavedFiles = 3;
const responsesJSONKey = "r";
const trackersJSONKey = "t";

const runStorageInitialization = async () => {
    const startTime = performance.now();
    const directoryResponse = await FileSystem.getInfoAsync(storageDirectory);
    console.log(`Local storage directory exists: ${directoryResponse.exists}.`);
    if (!directoryResponse.exists) {
        await FileSystem.makeDirectoryAsync(storageDirectory);
        console.log(`Creating local storage directory at ${storageDirectory}.`);
    }

    let data = {
        pastResponses: [],
        trackers: [],
        selectedTrackers: [],
        noSaveData: !directoryResponse.exists
    };

    const saveFiles = await FileSystem.readDirectoryAsync(storageDirectory);
    if (saveFiles.length > 0) {
        const loadedData = await loadData(saveFiles);
        data.pastResponses = loadedData.pastResponses;
        data.trackers = loadedData.trackerData.trackers;
        data.selectedTrackers = loadedData.trackerData.selectedTrackers;
    }

    console.log(`runStorageInitialization latency: ${performance.now() - startTime}ms`);
    return data;
}

const loadData = async (files) => {
    files.sort();
    files.reverse();

    const fileData = await FileSystem.readAsStringAsync(`${storageDirectory}${files[0]}`);
    console.log(`Loaded ${fileData.length} characters from ${files[0]}.`);
    if (fileData.length === 0) return null;

    try {
        const fileJson = JSON.parse(fileData);
        const minResponseData = fileJson[responsesJSONKey];
        const pastResponses = minResponseData.map(responseSet => responseSet.map(response => ({ timestamp: response.t, value: response.v, notes: response.n })));
        const trackerData = fileJson[trackersJSONKey];
        return { pastResponses, trackerData };
    } catch (e) {
        return null;
    }
}

const writeAppData = async (context) => {
    const startTime = performance.now();

    const dataToSave = { version: saveFileVersion };
    dataToSave[responsesJSONKey] = context.pastResponses.map(responseSet =>
        responseSet.map(response => ({
            t: response.timestamp,
            v: response.value,
            n: response.notes
        })
    ));
    dataToSave[trackersJSONKey] = {
        trackers: context.trackers,
        selectedTrackers: context.selectedTrackers
    };

    const dataText = JSON.stringify(dataToSave);
    const fileName = `${(new Date().getTime())}_${saveFileVersion}_${saveFileName}`;
    const filePath = `${storageDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, dataText);

    const saveFiles = await FileSystem.readDirectoryAsync(storageDirectory);
    if (saveFiles.length > maxSavedFiles) {
        saveFiles.sort();
        saveFiles.reverse();
        for (let i = maxSavedFiles; i < saveFiles.length; i++) {
            await FileSystem.deleteAsync(`${storageDirectory}${saveFiles[i]}`);
            console.log(`Deleted old save file ${storageDirectory}${saveFiles[i]}.`);
        }
    }

    console.log(`writeAppData latency: ${performance.now() - startTime}ms. ${(dataText.length / 1024).toFixed(3)} kb written to ${fileName}.`);
}

const deleteLocalStorage = async () => {
    const storageResponse = await FileSystem.getInfoAsync(storageDirectory);
    console.log(storageResponse)
    if (storageResponse.exists) {
        FileSystem.deleteAsync(storageDirectory);
        const response = await FileSystem.getInfoAsync(storageDirectory);
        console.log(`Local storage directory exists after deletion: ${response.exists}.`);
    }
}

export { runStorageInitialization, writeAppData, deleteLocalStorage }
