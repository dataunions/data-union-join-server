const chai = require('chai')
const { assert, expect } = chai
chai.use(require('chai-as-promised'))
const sinon = require('sinon')
const pino = require('pino')
const { JoinRequestService, DataUnionJoinError, DataUnionRetrievalError } = require('../../src/service/JoinRequestService')
const domain = require('../../src/domain')

describe('Join Request Service', () => {
	const MEMBER_ADDRESS = '0x0123456789012345678901234567890123456789'
	const DATAUNION_ADDRESS = '0x1234567890123456789012345678901234567890'

	const member = new domain.Address(MEMBER_ADDRESS)
	const dataUnion = new domain.Address(DATAUNION_ADDRESS)

	let joinRequestService
	let dataUnionClient
	let dataUnionObject
	let logger

	before(() => {
		logger = pino({
			name: 'main',
			level: 'info',
		})
	})

	beforeEach(() => {
		dataUnionObject = {
			addMembers: sinon.stub().resolves(true),
		}

		dataUnionClient = {
			getDataUnion: sinon.stub().resolves(dataUnionObject),
		}

		joinRequestService = new JoinRequestService(logger)
	})

	afterEach(() => {
		joinRequestService = undefined
	})

	describe('create', () => {

		it('adds members using the DU client', async () => {
			const response = await joinRequestService.create(dataUnionClient, member, dataUnion)
			assert.isTrue(dataUnionObject.addMembers.calledWith([MEMBER_ADDRESS]))
			assert.equal(response.member, MEMBER_ADDRESS)
			assert.equal(response.dataUnion, DATAUNION_ADDRESS)
		})
	
		it('rejects when data union is not found', async () => {
			dataUnionClient.getDataUnion = sinon.stub().rejects()
			await expect(joinRequestService.create(dataUnionClient, member, dataUnion)).to.be.rejectedWith(DataUnionRetrievalError)
		})
	
		it('rejects when joining data union fails', async () => {
			dataUnionObject.addMembers = sinon.stub().rejects()
			await expect(joinRequestService.create(dataUnionClient, member, dataUnion)).to.be.rejectedWith(DataUnionJoinError)
		})
	})

})
