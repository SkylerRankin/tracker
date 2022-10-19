import * as FileSystem from 'expo-file-system';

const storageDirectory = `${FileSystem.documentDirectory}tracker_local_storage/`;
const responsesFilePath = storageDirectory + "responses.json";
const trackersFilePath = storageDirectory + "trackers.json";

const runStorageInitialization = async () => {
    const startTime = performance.now();
    const directoryResponse = await FileSystem.getInfoAsync(storageDirectory);
    console.log(`Local storage directory exists: ${directoryResponse.exists}.`);
    if (!directoryResponse.exists) {
        await FileSystem.makeDirectoryAsync(storageDirectory);
        console.log(`Creating local storage directory at ${storageDirectory}.`);
    }

    const responsesFile = await FileSystem.getInfoAsync(responsesFilePath);
    const trackersFile = await FileSystem.getInfoAsync(trackersFilePath);
    let data = {
        pastResponses: [],
        trackers: [],
        selectedTrackers: [],
        savedFiles: {
            responses: responsesFile.exists,
            trackers: trackersFile.exists
        }
    };

    if (responsesFile.exists) {
        const pastResponses = await loadResponses();
        if (pastResponses !== null) {
            data.pastResponses = await loadResponses();
        }
    }

    if (trackersFile.exists) {
        const trackerData = await loadTrackers();
        if (trackerData !== null) {
            data.trackers = trackerData.trackers;
            data.selectedTrackers = trackerData.selectedTrackers;
        }
    }

    console.log(`runStorageInitialization latency: ${performance.now() - startTime}ms`);
    return data;
}

const loadResponses = async () => {
    const startTime = performance.now();

    const responseFileData = await FileSystem.readAsStringAsync(responsesFilePath);
    console.log(`Loaded ${responseFileData.length} characters from ${responsesFilePath}.`);

    let results;
    if (responseFileData.length === 0) {
        results = null;
    } else {
        const minResponseData = JSON.parse(responseFileData);
        results = minResponseData.map(responseSet => responseSet.map(response => ({ timestamp: response.t, value: response.v, notes: response.n })));    
    }

    console.log(`loadResponses latency: ${performance.now() - startTime}ms`);
    return results;
}

const loadTrackers = async () => {
    const startTime = performance.now();

    const trackersFileData = await FileSystem.readAsStringAsync(trackersFilePath);
    console.log(`Loaded ${trackersFileData.length} characters from ${trackersFilePath}.`);
    const results = trackersFileData.length === 0 ? null : JSON.parse(trackersFileData);

    console.log(`loadTrackers latency: ${performance.now() - startTime}ms`);
    return results;
}

const writeAppData = async (context) => {
    const startTime = performance.now();

    if (context.savedFiles.responses) {
        await FileSystem.deleteAsync(responsesFilePath);
    }

    if (context.savedFiles.trackers) {
        await FileSystem.deleteAsync(trackersFilePath);
    }

    const pastResponsesText = JSON.stringify(context.pastResponses.map(responseSet =>
        responseSet.map(response => ({
            t: response.timestamp,
            v: response.value,
            n: response.notes
        })
    )));
    await FileSystem.writeAsStringAsync(responsesFilePath, pastResponsesText);
    
    const trackerData = {
        trackers: context.trackers,
        selectedTrackers: context.selectedTrackers
    };
    const trackerText = JSON.stringify(trackerData);
    await FileSystem.writeAsStringAsync(trackersFilePath, trackerText);

    console.log(`writeAppData latency: ${performance.now() - startTime}ms`);
}

const deleteLocalStorage = async () => {
    FileSystem.deleteAsync(storageDirectory);
    const response = await FileSystem.getInfoAsync(storageDirectory);
    console.log(`Local storage directory exists after deletion: ${response.exists}.`);
}

export { runStorageInitialization, loadResponses, loadTrackers, writeAppData, deleteLocalStorage }
