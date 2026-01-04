import { useState } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '../../lib/context/AuthContext';
import { ProfileStyles } from '../../styles/ProfileStyles';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProfileDisplay from '../../components/ProfileDisplay';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import ProfileOverlay from '../../components/drawer/ProfileOverlay';
import NameOverlay from '../../components/drawer/NameOverlay';
import EmailOverlay from '../../components/drawer/EmailOverlay';
import PasswordOverlay from '../../components/drawer/PasswordOverlay';
import DeleteOverlay from '../../components/drawer/DeleteOverlay';
import { PressableOpacity } from '../../components/PressableOpacity';
import { useModal } from '../../lib/context/ModalContext';
import { useSpinner } from '../../lib/context/SpinnerContext';
import { Logger } from '../../lib/Logger';


export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [profileKey, setProfileKey] = useState(user?.profile || "default");
    const [profileVisible, setProfileVisible] = useState(false);
    const [nameVisible, setNameVisible] = useState(false);
    const [emailVisible, setEmailVisible] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const { setMessage } = useModal();
    const { showSpinner, hideSpinner } = useSpinner();

    async function handleLogout() {
        try {
            showSpinner();
            await logout();
        } catch (error) {
            Logger.error(error);
            setMessage("Logout failed");
        } finally {
            hideSpinner();
        }
    };

    return (
        <View style={ProfileStyles.container}>
            <PressableOpacity
                style={ProfileStyles.profile}
                onPress={() => setProfileVisible(true)}
            >
                <ProfileDisplay
                    isMini={false}
                    profileKey={user?.profile}
                />
                <View style={ProfileStyles.editButton}>
                    <FontAwesome name="pencil" size={20} />
                </View>
            </PressableOpacity>
            <PressableOpacity
                style={ProfileStyles.row}
                onPress={() => setNameVisible(true)}
            >
                <Text style={ProfileStyles.text}>Name</Text>
                <View style={ProfileStyles.changeBtn}>
                    <Text style={ProfileStyles.text}>{user?.name}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </View>
            </PressableOpacity>
            <PressableOpacity
                style={ProfileStyles.row}
                onPress={() => setEmailVisible(true)}
            >
                <Text style={ProfileStyles.text}>Email</Text>
                <View style={ProfileStyles.changeBtn}>
                    <Text style={ProfileStyles.text}>{user?.email}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </View>
            </PressableOpacity>
            <PressableOpacity
                style={ProfileStyles.row}
                onPress={() => setPasswordVisible(true)}
            >
                <Text style={ProfileStyles.text}>Change Password</Text>
                <View style={ProfileStyles.changeBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </View>
            </PressableOpacity>
            <PressableOpacity
                style={ProfileStyles.row}
                onPress={() => setDeleteVisible(true)}
            >
                <Text style={ProfileStyles.text}>Delete Account</Text>
                <View style={ProfileStyles.changeBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </View>
            </PressableOpacity>
            <PressableOpacity
                style={ProfileStyles.row}
                onPress={handleLogout}
            >
                <Text style={ProfileStyles.text}>Logout</Text>
                <View style={ProfileStyles.changeBtn}>
                    <MaterialCommunityIcons name="chevron-right" size={30} />
                </View>
            </PressableOpacity>
            <ProfileOverlay
                visible={profileVisible}
                setVisible={setProfileVisible}
                profileKey={profileKey}
                setProfileKey={setProfileKey}
            />
            <NameOverlay visible={nameVisible} setVisible={setNameVisible} />
            <PasswordOverlay
                visible={passwordVisible}
                setVisible={setPasswordVisible}
            />
            <EmailOverlay visible={emailVisible} setVisible={setEmailVisible} />
            <DeleteOverlay
                visible={deleteVisible}
                setVisible={setDeleteVisible}
            />
        </View>
    );
}
