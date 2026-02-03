import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useEffect } from 'react';

export default function BlockScreen() {
    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>App Blocked</Text>
            <Text style={styles.subtitle}>Stay focused. This app is restricted.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: '#CBD5F5',
        marginTop: 10,
    },
});
