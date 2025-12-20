import { Text, View, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { DataStore } from "@aws-amplify/datastore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAuthSession } from "aws-amplify/auth";

// project imports
import { createJoinStyles } from "../../styles/CreateJoinStyles";
import { useLoad } from "../../helper/context/LoadingContext";
import { Organization } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import { handleError } from "../../helper/Utils";
import { CreateOrgScreenProps } from "../../types/ScreenTypes";
import { validateRequirements } from "../../helper/drawer/CreateOrgUtils";
import { createOrg, createOrgUserStorage } from "../../helper/CreateUtils";
import { useNetwork } from "../../helper/context/NetworkContext";

/*
  Screen for creating an organization, user enters the name of the org
  and a random access code is generated. The user that creates the org is
  automatically the manager of the org.
*/
export default function CreateOrgScreen({ navigation }: CreateOrgScreenProps) {
  const { setIsLoading } = useLoad();
  const [name, onChangeName] = useState("");
  const { user } = useUser();
  var randomstring = require("randomstring");
  const { isConnected } = useNetwork();

  // generate codes and check if they are unique. If not, generate another
  const generateCode = async () => {
    while (true) {
      const code = randomstring.generate({
        length: 7,
        capitalization: "uppercase",
      });
      // Check that access code is unique
      const orgs = await DataStore.query(Organization, (c) =>
        c.accessCode.eq(code),
      );
      if (orgs == null || orgs.length === 0) {
        return code;
      } else {
        console.log("Code already exists, generating another...");
      }
    }
  };

  // handle verification, creation, and navigation when creating a new Organization
  const handleCreate = async () => {
    try {
      setIsLoading(true);
      // Generate a random access code
      const code = await generateCode();
      const validated = await validateRequirements(name, user!);
      if (!validated) {
        setIsLoading(false);
        return;
      }
      // Get the user token for authorization to api calls
      const token = (await fetchAuthSession()).tokens?.idToken?.toString();
      if (token == null) throw new Error("Token not found");
      // Create the org and orgUserStorage
      const newOrg = await createOrg(token, name, code, user!.id);
      const success = await createOrgUserStorage(token, newOrg, user!);
      if (!success || !newOrg) {
        throw new Error("User not added to group successfully");
      }
      // use a key to keep track of currentOrg per user
      const key = user!.id + " currOrg";
      await AsyncStorage.setItem(key, JSON.stringify(newOrg));
      onChangeName("");
      setIsLoading(false);
      navigation.navigate("SyncScreen", {
        syncType: "CREATE",
        accessCode: code,
        newOrg: newOrg,
      });
    } catch (error) {
      handleError("handleCreate", error as Error, setIsLoading);
    }
  };

  return (
    <View style={createJoinStyles.mainContainer}>
      {isConnected ? (
        <View style={createJoinStyles.container}>
          <Text style={createJoinStyles.title}>Create Org</Text>
          <Text style={createJoinStyles.subtitle}>
            Create a name for your org.
          </Text>
          <Text style={createJoinStyles.subtitle}>
            Rule: 1-40 alphanumeric characters with no whitespaces (_ and - are
            allowed).
          </Text>
          <TextInput
            style={createJoinStyles.input}
            onChangeText={onChangeName}
            value={name}
            placeholder="Ex. Great_Org"
            keyboardType="default"
          />
          <TouchableOpacity
            style={createJoinStyles.button}
            onPress={() => {
              handleCreate();
            }}
          >
            <Text style={createJoinStyles.btnText}>Create Org</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={createJoinStyles.title}>No Connection</Text>
          <Text style={createJoinStyles.subtitle}>
            A connection is needed to Create an Org! Please check your internet
            connection and try again
          </Text>
        </>
      )}
    </View>
  );
}
