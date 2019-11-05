/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { Session, ImperativeError } from "@zowe/imperative";
import { posix } from "path";
import { Rename, ZosFilesConstants, ZosFilesMessages } from "../../../../";

import { ZosmfRestClient } from "../../../../../rest";

describe("Rename", () => {
    const putExpectStringSpy = jest.spyOn(ZosmfRestClient, "putExpectString");

    beforeEach(() => {
        putExpectStringSpy.mockClear();
        putExpectStringSpy.mockImplementation(async () => {
            return "";
        });
    });

    const dummySession = new Session({
        user: "dummy",
        password: "dummy",
        hostname: "machine",
        port: 443,
        protocol: "https",
        type: "basic"
    });

    describe("Data set", () => {
        const beforeDataSetName = "USER.BEFORE.SET";
        const afterDataSetName = "USER.AFTER.SET";

        describe("Success Scenarios", () => {
            it("Should send a request to rename a data set", async () => {
                const expectedPayload = { "request": "rename", "from-dataset": { dsn: beforeDataSetName } };
                const expectedEndpoint = posix.join(
                    ZosFilesConstants.RESOURCE,
                    ZosFilesConstants.RES_DS_FILES,
                    afterDataSetName,
                );
                const expectedHeaders = [
                    { "Content-Type": "application/json" },
                    { "Content-Length": JSON.stringify(expectedPayload).length.toString() },
                ];
                const response = await Rename.dataSet(dummySession, beforeDataSetName, afterDataSetName);

                expect(response).toEqual({
                    success: true,
                    commandResponse: ZosFilesMessages.dataSetRenamedSuccessfully.message,
                });
                expect(putExpectStringSpy).toHaveBeenCalledTimes(1);
                expect(putExpectStringSpy).toHaveBeenLastCalledWith(
                    dummySession,
                    expectedEndpoint,
                    expectedHeaders,
                    expectedPayload
                );
            });
        });
        describe("Failure Scenarios", () => {
            it("Should throw an error if the before data set name is missing", async () => {
                let error;
                try {
                    await Rename.dataSet(dummySession, undefined, afterDataSetName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should throw an error if the after data set name is missing", async () => {
                let error;
                try {
                    await Rename.dataSet(dummySession, beforeDataSetName, undefined);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should fail if the zOSMF REST client fails", async () => {
                const errorMessage = "Dummy error message";
                putExpectStringSpy.mockImplementation(() => {
                    throw new ImperativeError({ msg: errorMessage });
                });

                const expectedPayload = { "request": "rename", "from-dataset": { dsn: beforeDataSetName } };
                const expectedEndpoint = posix.join(
                    ZosFilesConstants.RESOURCE,
                    ZosFilesConstants.RES_DS_FILES,
                    afterDataSetName,
                );
                const expectedHeaders = [
                    { "Content-Type": "application/json" },
                    { "Content-Length": JSON.stringify(expectedPayload).length.toString() },
                ];

                let error;
                try {
                    await Rename.dataSet(dummySession, beforeDataSetName, afterDataSetName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(1);
                expect(putExpectStringSpy).toHaveBeenLastCalledWith(
                    dummySession,
                    expectedEndpoint,
                    expectedHeaders,
                    expectedPayload
                );
                expect(error).toContain(errorMessage);
            });
        });
    });
    describe("Data set member", () => {
        const dataSetName = "USER.DATA.SET";
        const beforeMemberName = "mem1";
        const afterMemberName = "mem2";

        describe("Success Scenarios", () => {
            it("Should send a request to rename a data set member", async () => {
                const expectedPayload = {
                    "request": "rename",
                    "from-dataset": { dsn: dataSetName, member: beforeMemberName },
                };
                const expectedEndpoint = posix.join(
                    ZosFilesConstants.RESOURCE,
                    ZosFilesConstants.RES_DS_FILES,
                    `${dataSetName}(${afterMemberName})`,
                );
                const expectedHeaders = [
                    { "Content-Type": "application/json" },
                    { "Content-Length": JSON.stringify(expectedPayload).length.toString() },
                ];
                const response = await Rename.dataSetMember(dummySession, dataSetName, beforeMemberName, afterMemberName);

                expect(response).toEqual({
                    success: true,
                    commandResponse: ZosFilesMessages.dataSetRenamedSuccessfully.message,
                });
                expect(putExpectStringSpy).toHaveBeenCalledTimes(1);
                expect(putExpectStringSpy).toHaveBeenLastCalledWith(
                    dummySession,
                    expectedEndpoint,
                    expectedHeaders,
                    expectedPayload
                );
            });
        });
        describe("Failure Scenarios", () => {
            it("Should throw an error if the data set name is undefined", async () => {
                let error;
                try {
                    await Rename.dataSetMember(dummySession, undefined, beforeMemberName, afterMemberName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should throw an error if the data set name is empty", async () => {
                let error;
                try {
                    await Rename.dataSetMember(dummySession, "", beforeMemberName, afterMemberName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should throw an error if the before member name is undefined", async () => {
                let error;
                try {
                    await Rename.dataSetMember(dummySession, dataSetName, undefined, afterMemberName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should throw an error if the after member name is undefined", async () => {
                let error;
                try {
                    await Rename.dataSetMember(dummySession, dataSetName, beforeMemberName, undefined);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(0);
                expect(error).toContain(ZosFilesMessages.missingDatasetName.message);
            });
            it("Should fail if the zOSMF REST client fails", async () => {
                const errorMessage = "Dummy error message";
                putExpectStringSpy.mockImplementation(() => {
                    throw new ImperativeError({ msg: errorMessage });
                });

                const expectedPayload = {
                    "request": "rename",
                    "from-dataset": { dsn: dataSetName, member: beforeMemberName },
                };
                const expectedEndpoint = posix.join(
                    ZosFilesConstants.RESOURCE,
                    ZosFilesConstants.RES_DS_FILES,
                    `${dataSetName}(${afterMemberName})`,
                );
                const expectedHeaders = [
                    { "Content-Type": "application/json" },
                    { "Content-Length": JSON.stringify(expectedPayload).length.toString() },
                ];

                let error;
                try {
                    await Rename.dataSetMember(dummySession, dataSetName, beforeMemberName, afterMemberName);
                } catch(err) {
                    error = err.message;
                }

                expect(putExpectStringSpy).toHaveBeenCalledTimes(1);
                expect(putExpectStringSpy).toHaveBeenLastCalledWith(
                    dummySession,
                    expectedEndpoint,
                    expectedHeaders,
                    expectedPayload
                );
                expect(error).toContain(errorMessage);
            });
        });
    });
});

