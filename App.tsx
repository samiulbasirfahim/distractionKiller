import { useEffect, useState } from 'react';
import {
    StatusBar,
    Text,
    useColorScheme,
    View,
    NativeModules,
    ScrollView,
    Switch,
    StyleSheet,
    AppState,
    ToastAndroid,
    Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { InstalledApp, AccessibilityModule } = NativeModules;

type AppItem = {
    name: string;
    identifier: string;
    limited: boolean;
};

function setLimit(identifier: string, value: boolean) {
    InstalledApp.setAppLimited(identifier, value);
}

function toggleEnabled(value: boolean) {
    InstalledApp.setBlockerEnabled(value);
}

async function checkAccessibilityPermission() {
    try {
        const hasPermission =
            await AccessibilityModule.hasAccessibilityPermission();

        if (Platform.OS === 'android' && !hasPermission) {
            ToastAndroid.show(
                'Please enable Accessibility Permission for proper functionality.',
                ToastAndroid.LONG,
            );
        }

        if (!hasPermission) {
            AccessibilityModule.openAccessibilitySettings();
        }
    } catch (error) {
        console.error('Error checking accessibility permission:', error);
    }
}

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    const [datas, setDatas] = useState<AppItem[]>([]);
    const [blockerEnabled, setBlockerEnabled] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                await checkAccessibilityPermission();

                const enabled = await InstalledApp.isBlockerEnabled();
                setBlockerEnabled(enabled);

                const apps = await InstalledApp.getInstalledApps();

                if (Array.isArray(apps)) {
                    const formatted = apps.map((x: AppItem) => ({
                        name: x.name,
                        identifier: x.identifier,
                        limited: x.limited,
                    }));

                    console.log('Fetched installed apps:', formatted);

                    setDatas(formatted);
                }
            } catch (error) {
                console.error('Error fetching installed apps:', error);
            }
        })();
    }, []);

    useEffect(() => {
        const unsubscribe = AppState.addEventListener('focus', async () => {
            await checkAccessibilityPermission();
        });

        return () => {
            unsubscribe.remove();
        };
    }, []);

    const toggleApp = (index: number) => {
        setDatas(prev =>
            prev.map((item, i) => {
                if (i === index) {
                    const newValue = !item.limited;
                    setLimit(item.identifier, newValue);

                    return { ...item, limited: newValue };
                }
                return item;
            }),
        );
    };

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={'dark-content'} />

            <SafeAreaView style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>App Blocker</Text>

                    <Switch
                        value={blockerEnabled}
                        onValueChange={value => {
                            setBlockerEnabled(value);
                            toggleEnabled(value);
                        }}
                    />
                </View>

                <ScrollView>
                    {datas.map((item, index) => (
                        <View key={item.identifier} style={styles.row}>
                            <View style={styles.left}>
                                <View style={styles.textWrap}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.package}>{item.identifier}</Text>
                                </View>
                            </View>

                            <Switch
                                value={item.limited}
                                onValueChange={() => toggleApp(index)}
                            />
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

export default App;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },

    header: {
        fontSize: 22,
        fontWeight: '700',
        marginVertical: 12,
        color: '#111',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
    },

    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },

    icon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        marginRight: 12,
    },

    textWrap: {
        flex: 1,
    },

    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111',
    },

    package: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
});
