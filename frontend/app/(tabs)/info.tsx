import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { User, Bell, Moon, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

const menuItems = [
  {
    icon: User,
    label: 'Edit Profile',
    color: colors.primary,
  },
  {
    icon: Bell,
    label: 'Notifications',
    color: colors.success,
  },
  {
    icon: Moon,
    label: 'Theme',
    color: colors.black,
  },
  {
    icon: HelpCircle,
    label: 'Help & Support',
    color: colors.gray,
  },
  {
    icon: LogOut,
    label: 'Log Out',
    color: colors.error,
  },
];

export default function InfoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={24} color={item.color} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <ChevronRight size={20} color={colors.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.milkyWhite,
  },
  header: {
    padding: 20,
    backgroundColor: colors.milkyWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.milkyWhite,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.black,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.milkyWhite,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontFamily: 'InterSemiBold',
    fontSize: 24,
    color: colors.milkyWhite,
  },
  name: {
    fontFamily: 'InterSemiBold',
    fontSize: 20,
    color: colors.black,
    marginBottom: 5,
  },
  email: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.black,
  },
  menuSection: {
    backgroundColor: colors.milkyWhite,
    marginTop: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.milkyWhite,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: colors.black,
    marginLeft: 15,
  },
});
