


#queryAll
peer chaincode query -C mychannel -n fabcar -c '{"Args":["queryAll"]}'


# Query University 1
peer chaincode query -C mychannel -n fabcar -c '{"Args":
["queryUniversityProfileByName","name1"]}'

# Query Certificate 1 
peer chaincode query -C mychannel -n fabcar -c '{"Args":
["queryCertificateByUUID","certUUID1"]}'

# Get all cert by uni 1
peer chaincode query -C mychannel -n fabcar -c '{"Args":["getAllCertificateByUniversity","universityPK1"]}'

# Get all cert for student 1
peer chaincode query -C mychannel -n fabcar -c '{"Args": ["getAllCertificateByStudent","studentPK1"]}'


peer chaincode query -C mychannel -n fabcar -c '{"Args": ["queryWithQueryString",
"{\"selector\":{\"studentPK\":\"studentPK2\",\"datatype\":\"certificate\"}}"]}'

# Register a University 1
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"registerUniversity","Args":["name1","universityPK1", "location1", "description1"]}'

# Register University 2.
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"registerUniversity","Args":["name2","universityPK2", "location2", "description2"]}'


#Issue Certificate 1

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"issueCertificate","Args":["certHash1", "universitySignature1", "studentSignature1", "dateOfIssuing1", "certUUID1", "universityPK1", "studentPK1"]}'

#Issue Certificate 2 (issued by uni1 to student 2 )
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n fabcar --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"issueCertificate","Args":["certHash2", "universitySignature2", "studentSignature2", "dateOfIssuing2", "certUUID2", "universityPK", "studentPK2"]}'






