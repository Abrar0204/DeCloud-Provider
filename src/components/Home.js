import {
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  IconButton,
  Box,
  TableContainer,
} from "@chakra-ui/react";
import React, { useState } from "react";
import format from "date-fns/format";
import logo from "../res/img/DeCloud Logo.png";
import { ChevronDownIcon, RepeatIcon } from "@chakra-ui/icons";
const Home = ({ ethers }) => {
  const {
    amountsEarned,
    refreshAmountEarned,
    disconnect,
    transferAmountToMetamask,
    totalAmount,
  } = ethers;

  const withdraw = (i) => () => transferAmountToMetamask(i);

  const [currency, setCurrency] = useState("inr");

  return (
    <Box padding="2">
      <Flex justify="space-between" align="center" padding="3">
        <Image
          src={logo}
          alt="DeCloud"
          width="50px"
          onClick={disconnect}
          _hover={{ cursor: "pointer" }}
        />

        <Flex align="center">
          <Text marginRight="2">Currency:</Text>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              {currency.toUpperCase()}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setCurrency("inr")}>INR</MenuItem>
              <MenuItem onClick={() => setCurrency("ether")}>ETHER</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Flex direction="column" align="center" my="5">
        <Heading>Your Earnings</Heading>
        <Heading fontSize="50px" fontFamily="fantasy" fontWeight="400">
          {totalAmount[currency]} {currency.toUpperCase().slice(0, 3)}
        </Heading>
        <IconButton icon={<RepeatIcon />} onClick={refreshAmountEarned}>
          Refresh
        </IconButton>
      </Flex>

      <Heading fontSize="30" fontFamily="fantasy" fontWeight="400" mb="2">
        History
      </Heading>
      <TableContainer paddingX="3">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date of payment</Th>
              <Th>Amount ({currency.toUpperCase()})</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {amountsEarned.map((a, i) => (
              <Tr key={a.date}>
                <Td>{format(a.date, "dd MMM yyyy hh:mm aaa")}</Td>
                <Td>{a.amount[currency]}</Td>
                <Td>
                  {a.isPaid ? (
                    "Withdrawn"
                  ) : (
                    <Button onClick={withdraw(i)}>Withdraw</Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Home;
