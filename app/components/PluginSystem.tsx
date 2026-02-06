import { useState, useRef } from "react";
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
} from "@chakra-ui/react";
import PluginShop from "./PluginShop";
import MyPlugins from "./MyPlugins";
import UnlockTiers from "./UnlockTiers";
import CreatePlugin from "./CreatePlugin";

const PluginSystem = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // Refs to trigger refreshes in child components
  const myPluginsRef = useRef<{ refresh: () => void }>(null);
  const pluginShopRef = useRef<{ refresh: () => void }>(null);
  const unlockTiersRef = useRef<{ refresh: () => void }>(null);

  // Handle tab change - refresh the tab being switched to
  const handleTabChange = (index: number) => {
    setTabIndex(index);

    // Refresh data when switching tabs
    setTimeout(() => {
      if (index === 0) myPluginsRef.current?.refresh();
      if (index === 1) pluginShopRef.current?.refresh();
      if (index === 2) unlockTiersRef.current?.refresh();
    }, 100);
  };

  return (
    <Box
      w="full"
      maxW="1200px"
      borderWidth={2}
      borderRadius="xl"
      borderColor="purple.400"
      bg="purple.50"
      p={6}
    >
      <Tabs
        colorScheme="purple"
        variant="enclosed"
        index={tabIndex}
        onChange={handleTabChange}
      >
        <TabList>
          <Tab>🎮 My Plugins</Tab>
          <Tab>🏪 Plugin Shop</Tab>
          <Tab>🔓 Unlock Tiers</Tab>
          <Tab>🎨 Create Plugin</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <MyPlugins ref={myPluginsRef} />
          </TabPanel>

          <TabPanel>
            <PluginShop
              ref={pluginShopRef}
              onPluginInstalled={() => {
                // Switch to My Plugins tab after installing
                setTabIndex(0);
              }}
            />
          </TabPanel>

          <TabPanel>
            <UnlockTiers ref={unlockTiersRef} />
          </TabPanel>

          <TabPanel>
            <CreatePlugin
              onPluginCreated={() => {
                // Refresh shop after creating
                pluginShopRef.current?.refresh();
                // Switch to Plugin Shop tab
                setTabIndex(1);
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PluginSystem;
