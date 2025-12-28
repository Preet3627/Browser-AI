import React, { useState, useRef, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
  PermissionsAndroid,
  FlatList,
  Switch,
  Slider,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Layers,
  ShieldCheck,
  Zap,
  Phone,
  Users,
  MessageSquare,
  FolderSync,
  Shield,
  Settings,
  X,
  Plus,
  Volume2,
  VolumeX,
  Star,
  Trash2,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const DEFAULT_URL = 'http://10.0.2.2:3000';

// Tab interface
interface Tab {
  id: string;
  url: string;
  title: string;
  active: boolean;
  keepAliveInBackground: boolean;
  customSound?: {
    enabled: boolean;
    soundUrl?: string;
    volume: number;
    muteOtherTabs: boolean;
  };
  priority: 'high' | 'normal' | 'low';
}

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  // Tab management
  const [tabs, setTabs] = useState<Tab[]>([{
    id: 'tab-1',
    url: DEFAULT_URL,
    title: 'Home',
    active: true,
    keepAliveInBackground: false,
    priority: 'normal',
    customSound: { enabled: false, volume: 1.0, muteOtherTabs: false }
  }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  const [inputValue, setInputValue] = useState(DEFAULT_URL);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const webViewRefs = useRef<Map<string, WebView>>(new Map());
  const inputRef = useRef<TextInput>(null);

  // UI states
  const [showMenu, setShowMenu] = useState(false);
  const [showTabManager, setShowTabManager] = useState(false);
  const [showTabSettings, setShowTabSettings] = useState(false);
  const [selectedTabForSettings, setSelectedTabForSettings] = useState<string | null>(null);

  // Feature states
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [otpMessages, setOtpMessages] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  // Animations
  const topBarAnim = useRef(new Animated.Value(0)).current;
  const bottomBarAnim = useRef(new Animated.Value(0)).current;
  const menuAnim = useRef(new Animated.Value(-width)).current;
  const tabManagerAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(topBarAnim, { toValue: 1, useNativeDriver: true }),
      Animated.spring(bottomBarAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };

  const getActiveTab = () => tabs.find(t => t.id === activeTabId);

  const handleGo = () => {
    let targetUrl = inputValue.trim();
    if (!targetUrl.startsWith('http')) {
      if (targetUrl.includes('.') && !targetUrl.includes(' ')) {
        targetUrl = `https://${targetUrl}`;
      } else {
        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
      }
    }

    // Update active tab URL
    setTabs(tabs.map(tab =>
      tab.id === activeTabId ? { ...tab, url: targetUrl } : tab
    ));
    setInputValue(targetUrl);
  };

  const createNewTab = () => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      url: DEFAULT_URL,
      title: 'New Tab',
      active: false,
      keepAliveInBackground: false,
      priority: 'normal',
      customSound: { enabled: false, volume: 1.0, muteOtherTabs: false }
    };

    setTabs([...tabs, newTab]);
    switchToTab(newTab.id);
    Alert.alert('New Tab', `Created tab ${tabs.length + 1}`);
  };

  const switchToTab = (tabId: string) => {
    setTabs(tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    })));
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setInputValue(tab.url);
    }
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      Alert.alert('Cannot Close', 'You must have at least one tab open');
      return;
    }

    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);

    if (activeTabId === tabId) {
      switchToTab(newTabs[0].id);
    }
  };

  const toggleTabManager = () => {
    const toValue = showTabManager ? height : 0;
    Animated.spring(tabManagerAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setShowTabManager(!showTabManager);
  };

  const toggleMenu = () => {
    const toValue = showMenu ? -width : 0;
    Animated.spring(menuAnim, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    setShowMenu(!showMenu);
  };

  const openTabSettings = (tabId: string) => {
    setSelectedTabForSettings(tabId);
    setShowTabSettings(true);
  };

  const updateTabSetting = (tabId: string, key: string, value: any) => {
    setTabs(tabs.map(tab => {
      if (tab.id === tabId) {
        if (key.startsWith('customSound.')) {
          const soundKey = key.split('.')[1];
          return {
            ...tab,
            customSound: { ...tab.customSound!, [soundKey]: value }
          };
        }
        return { ...tab, [key]: value };
      }
      return tab;
    }));
  };

  const theme = {
    bg: isDarkMode ? '#050505' : '#ffffff',
    surface: isDarkMode ? '#121212' : '#f8f8f8',
    text: isDarkMode ? '#ffffff' : '#000000',
    accent: '#00ffff',
    border: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  const activeTab = getActiveTab();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Animated Header */}
        <Animated.View style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: theme.bg,
            borderBottomColor: theme.border,
            transform: [{ translateY: topBarAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 0] }) }]
          }
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Settings size={20} color={theme.accent} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => inputRef.current?.focus()}
              style={[styles.searchBar, { backgroundColor: theme.surface, flex: 1 }]}
            >
              <ShieldCheck size={16} color={theme.accent} style={{ marginRight: 8 }} />
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: theme.text }]}
                value={inputValue}
                onChangeText={setInputValue}
                onSubmitEditing={handleGo}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Search or enter URL"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
              />
              {loading && <ActivityIndicator size="small" color={theme.accent} style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>

          {/* Tab Counter */}
          <View style={styles.tabCounter}>
            <Text style={[styles.tabCountText, { color: theme.text }]}>
              Tab {tabs.findIndex(t => t.id === activeTabId) + 1} of {tabs.length}
            </Text>
            {activeTab?.keepAliveInBackground && (
              <View style={styles.keepAliveBadge}>
                <Text style={styles.keepAliveText}>BG</Text>
              </View>
            )}
            {activeTab?.customSound?.enabled && (
              <Volume2 size={12} color={theme.accent} />
            )}
          </View>
        </Animated.View>

        {/* WebView Container - Render all tabs */}
        <View style={styles.webViewContainer}>
          {tabs.map(tab => (
            <View
              key={tab.id}
              style={[
                styles.webView,
                { display: tab.id === activeTabId ? 'flex' : 'none' }
              ]}
            >
              <WebView
                ref={(ref) => {
                  if (ref) webViewRefs.current.set(tab.id, ref);
                }}
                source={{ uri: tab.url }}
                onLoadStart={() => tab.id === activeTabId && setLoading(true)}
                onLoadEnd={() => tab.id === activeTabId && setLoading(false)}
                onLoadProgress={({ nativeEvent }) =>
                  tab.id === activeTabId && setProgress(nativeEvent.progress)
                }
                onNavigationStateChange={(navState) => {
                  if (tab.id === activeTabId) {
                    setInputValue(navState.url);
                    updateTabSetting(tab.id, 'title', navState.title || 'Untitled');
                  }
                }}
              />
            </View>
          ))}
          {progress < 1 && progress > 0 && (
            <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.accent }]} />
          )}
        </View>

        {/* Animated Floating Bottom Nav */}
        <Animated.View style={[
          styles.bottomNav,
          {
            paddingBottom: insets.bottom + 10,
            backgroundColor: theme.bg,
            borderTopColor: theme.border,
            transform: [{ translateY: bottomBarAnim.interpolate({ inputRange: [0, 1], outputRange: [100, 0] }) }]
          }
        ]}>
          <TouchableOpacity onPress={() => webViewRefs.current.get(activeTabId)?.goBack()} style={styles.navButton}>
            <ArrowLeft size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => webViewRefs.current.get(activeTabId)?.goForward()} style={styles.navButton}>
            <ArrowRight size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleTabManager}
            style={[styles.homeButton, { shadowColor: theme.accent }]}
          >
            <Layers size={24} color="#000" />
            {tabs.length > 1 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tabs.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => webViewRefs.current.get(activeTabId)?.reload()} style={styles.navButton}>
            <RotateCw size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={createNewTab} style={styles.navButton}>
            <Plus size={22} color={theme.accent} />
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Tab Manager Modal */}
      <Animated.View style={[
        styles.tabManager,
        {
          backgroundColor: theme.bg,
          transform: [{ translateY: tabManagerAnim }]
        }
      ]}>
        <View style={[styles.tabManagerHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.tabManagerTitle, { color: theme.text }]}>
            Tabs ({tabs.length}/50)
          </Text>
          <TouchableOpacity onPress={toggleTabManager}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={tabs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                {
                  backgroundColor: item.active ? theme.surface : 'transparent',
                  borderColor: theme.border
                }
              ]}
              onPress={() => {
                switchToTab(item.id);
                toggleTabManager();
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.tabItemTitle, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.tabItemUrl} numberOfLines={1}>
                  {item.url}
                </Text>
                <View style={styles.tabItemBadges}>
                  {item.keepAliveInBackground && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Background</Text>
                    </View>
                  )}
                  {item.customSound?.enabled && (
                    <View style={[styles.badge, { backgroundColor: '#00ffff20' }]}>
                      <Volume2 size={10} color={theme.accent} />
                      <Text style={[styles.badgeText, { color: theme.accent }]}>Sound</Text>
                    </View>
                  )}
                  {item.priority === 'high' && (
                    <View style={[styles.badge, { backgroundColor: '#ff000020' }]}>
                      <Star size={10} color="#ff0000" />
                      <Text style={[styles.badgeText, { color: '#ff0000' }]}>High</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => openTabSettings(item.id)}
                style={styles.tabSettingsButton}
              >
                <Settings size={18} color={theme.text} />
              </TouchableOpacity>

              {tabs.length > 1 && (
                <TouchableOpacity
                  onPress={() => closeTab(item.id)}
                  style={styles.tabCloseButton}
                >
                  <X size={18} color="#ff0000" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}
        />
      </Animated.View>

      {/* Tab Settings Modal */}
      <Modal
        visible={showTabSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTabSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Tab Settings</Text>
              <TouchableOpacity onPress={() => setShowTabSettings(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTabForSettings && (() => {
                const tab = tabs.find(t => t.id === selectedTabForSettings);
                if (!tab) return null;

                return (
                  <>
                    <View style={styles.settingItem}>
                      <Text style={[styles.settingLabel, { color: theme.text }]}>Keep Active in Background</Text>
                      <Switch
                        value={tab.keepAliveInBackground}
                        onValueChange={(value) => updateTabSetting(tab.id, 'keepAliveInBackground', value)}
                        trackColor={{ false: '#767577', true: theme.accent }}
                      />
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={[styles.settingLabel, { color: theme.text }]}>Priority</Text>
                      <View style={styles.priorityButtons}>
                        {(['low', 'normal', 'high'] as const).map((priority) => (
                          <TouchableOpacity
                            key={priority}
                            style={[
                              styles.priorityButton,
                              tab.priority === priority && { backgroundColor: theme.accent }
                            ]}
                            onPress={() => updateTabSetting(tab.id, 'priority', priority)}
                          >
                            <Text style={[
                              styles.priorityButtonText,
                              tab.priority === priority && { color: '#000' }
                            ]}>
                              {priority.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.settingItem}>
                      <Text style={[styles.settingLabel, { color: theme.text }]}>Custom Sound</Text>
                      <Switch
                        value={tab.customSound?.enabled || false}
                        onValueChange={(value) => updateTabSetting(tab.id, 'customSound.enabled', value)}
                        trackColor={{ false: '#767577', true: theme.accent }}
                      />
                    </View>

                    {tab.customSound?.enabled && (
                      <>
                        <View style={styles.settingItem}>
                          <Text style={[styles.settingLabel, { color: theme.text }]}>
                            Volume: {Math.round((tab.customSound.volume || 1) * 100)}%
                          </Text>
                          <Slider
                            style={{ flex: 1, marginLeft: 16 }}
                            minimumValue={0}
                            maximumValue={1}
                            value={tab.customSound.volume || 1}
                            onValueChange={(value) => updateTabSetting(tab.id, 'customSound.volume', value)}
                            minimumTrackTintColor={theme.accent}
                            maximumTrackTintColor="#666"
                          />
                        </View>

                        <View style={styles.settingItem}>
                          <Text style={[styles.settingLabel, { color: theme.text }]}>Mute Other Tabs</Text>
                          <Switch
                            value={tab.customSound.muteOtherTabs || false}
                            onValueChange={(value) => updateTabSetting(tab.id, 'customSound.muteOtherTabs', value)}
                            trackColor={{ false: '#767577', true: theme.accent }}
                          />
                        </View>
                      </>
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Side Menu (existing features) */}
      <Animated.View style={[
        styles.sideMenu,
        {
          backgroundColor: theme.bg,
          transform: [{ translateX: menuAnim }]
        }
      ]}>
        <View style={[styles.menuHeader, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.menuTitle}>Comet AI Browser</Text>
          <TouchableOpacity onPress={toggleMenu}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.menuContent}>
          {/* Existing menu items... */}
          <TouchableOpacity style={styles.menuItem}>
            <FolderSync size={20} color={syncEnabled ? '#00ff00' : theme.text} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.menuItemText, { color: theme.text }]}>Cross-Device Sync</Text>
              <Text style={styles.menuItemDesc}>
                {syncEnabled ? 'Syncing files & folders' : 'Tap to enable'}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Menu Overlay */}
      {(showMenu || showTabManager) && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => {
            if (showMenu) toggleMenu();
            if (showTabManager) toggleTabManager();
          }}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
  },
  tabCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  keepAliveBadge: {
    backgroundColor: '#00ff0020',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  keepAliveText: {
    fontSize: 9,
    color: '#00ff00',
    fontWeight: '700',
  },
  webViewContainer: { flex: 1 },
  webView: { flex: 1 },
  progressBar: {
    position: 'absolute',
    top: 0,
    height: 2,
    zIndex: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  homeButton: {
    width: 54,
    height: 54,
    backgroundColor: '#00ffff',
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  tabManager: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  tabManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  tabManagerTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  tabItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabItemUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tabItemBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00ff0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00ff00',
  },
  tabSettingsButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabCloseButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.85,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 99,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00ffff',
  },
  menuContent: {
    flex: 1,
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItemDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
