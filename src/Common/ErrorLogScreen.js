import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { clearErrorLogs, getErrorLogs } from './ErrorLogger';
// import { getErrorLogs, clearErrorLogs } from './utils/ErrorLogger';

export default function ErrorLogScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      setLogs(await getErrorLogs());
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <Button title="Clear Logs" onPress={async () => {
        await clearErrorLogs();
        setLogs([]);
      }} />
      <ScrollView>
        {logs.map((log, i) => (
          <View key={i} style={{ marginVertical: 5, padding: 10, borderWidth: 1, borderRadius: 5 }}>
            <Text>🕒 {log.time}</Text>
            <Text>⚠️ {log.message}</Text>
            {log.stack && <Text numberOfLines={4}>Stack: {log.stack}</Text>}
            {log.extra && <Text>Extra: {JSON.stringify(log.extra)}</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
