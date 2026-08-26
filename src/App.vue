<template>
  <div class="container">
    <h1 class="text-center">Create Consumer Application</h1>
    <section class="setup-card" :class="{'setup-card--saved': hasSavedTestData}">
      <div>
        <strong>{{ hasSavedTestData ? 'Local test-data defaults are active' : 'First-time setup' }}</strong>
        <p class="mb-0">
          {{ hasSavedTestData ? 'Save again whenever you want to replace the defaults.' : 'Set the values below, then save them once for future test runs.' }}
          Saved only in <code>server/.local/test-data.json</code> on this machine.
        </p>
      </div>
      <button type="button" class="btn btn-outline-primary setup-save-button" @click="saveTestDataDefaults" :disabled="isSavingDefaults || isRunning">
        {{ isSavingDefaults ? 'Saving…' : 'Save as Local Defaults' }}
      </button>
    </section>

    <div v-if="isRunning" class="run-status" role="status" aria-live="polite">
      <span class="run-status__spinner" aria-hidden="true"></span>
      <div>
        <strong>Test run in progress</strong>
        <span>{{ runStatus.path }}<template v-if="runStatus.total > 1"> · {{ runStatus.completed }}/{{ runStatus.total }} complete</template></span>
      </div>
      <span class="run-status__pulse" aria-hidden="true">Running</span>
    </div>

    <form id="testForm" class="mt-4" @submit.prevent="runTests">
      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="hasCoApplicant" v-model="formData.hasCoApplicant"/>
        <label class="form-check-label" for="hasCoApplicant">Add Co-Applicant (email is Nathaniel.lee+{random_num}@ncino.com)</label>
      </div>

      <div class="form-group" v-if="formData.hasCoApplicant">
        <a class="d-flex align-items-center" @click="toggleSection('customCoApp')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customCoApp ? '▼' : '▶' }}</span>
          Customize Co-Applicant Info
        </a>
      </div>

      <div class="mt-3" v-if="formData.hasCoApplicant && sections.customCoApp">
        <div class="form-group">
          <label for="coappFirstName">Co-Applicant First Name: <span class="text-muted">Default is NateCoapp</span></label>
          <input type="text" class="form-control" id="coappFirstName" v-model="formData.coappFirstName"/>
        </div>
        <div class="form-group">
          <label for="coappLastName">Co-Applicant Last Name: <span class="text-muted">Default is Pass</span></label>
          <input type="text" class="form-control" id="coappLastName" v-model="formData.coappLastName"/>
        </div>
        <div class="form-group">
          <label for="coappPhone">Co-Applicant Phone: <span class="text-muted">Default is (111) 111-1111</span></label>
          <input type="tel" inputmode="numeric" maxlength="14" class="form-control" id="coappPhone" :value="formData.coappPhone" @input="formatPhoneField('coappPhone', $event)"/>
        </div>
        <div class="form-group">
          <label for="coappEmail">Co-Applicant Email: <span class="text-muted">Default is a random Nathaniel.lee+{random_num}@ncino.com</span></label>
          <input type="text" class="form-control" id="coappEmail" v-model="formData.coappEmail"/>
        </div>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="failEligibility" v-model="formData.failEligibility"/>
        <label class="form-check-label" for="failEligibility">Fail eligibility</label>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="skipEligibility" v-model="formData.skipEligibility"/>
        <label class="form-check-label" for="skipEligibility">Skip eligibility</label>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="isPrefill" v-model="formData.isPrefill"/>
        <label class="form-check-label" for="isPrefill">
          Existing User who has completed KYC (this will ignore custom user and kyc changes)
        </label>
      </div>

      <div class="form-group">
        <a class="d-flex align-items-center" @click="toggleSection('customUserInfo')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customUserInfo ? '▼' : '▶' }}</span>
          Applicant
        </a>
      </div>

      <div class="mt-3 applicant-card" v-if="sections.customUserInfo">
        <div class="form-group">
          <label for="email">nCino Email:</label>
          <input type="text" class="form-control" id="email" v-model="formData.email" placeholder="nathaniel.lee@ncino.com"/>
          <small class="form-text text-muted">This is the stable base address. Each run adds a <code>+firstlast&lt;random&gt;</code> modifier before <code>@</code>; leave blank to derive an address from the applicant name.</small>
        </div>
        <div class="form-group">
          <label for="password">Password: <span class="text-muted">Default is RandomWords123</span></label>
          <input type="text" class="form-control" id="password" v-model="formData.password"/>
        </div>
        <div class="form-group">
          <label for="firstName">First Name: <span class="text-muted">Default is John</span></label>
          <input type="text" class="form-control" id="firstName" v-model="formData.firstName"/>
        </div>
        <div class="form-group">
          <label for="lastName">Last Name: <span class="text-muted">Default is Pass</span></label>
          <input type="text" class="form-control" id="lastName" v-model="formData.lastName"/>
        </div>
        <div class="form-group">
          <label for="phone">Phone: <span class="text-muted">Default is (234) 242-3423</span></label>
          <input type="tel" inputmode="numeric" maxlength="14" class="form-control" id="phone" :value="formData.phone" @input="formatPhoneField('phone', $event)"/>
        </div>
      </div>

      <div class="form-group">
        <a class="d-flex align-items-center" @click="toggleSection('customKyc')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customKyc ? '▼' : '▶' }}</span>
          Customize KYC (Know Your Customer Information)
        </a>
      </div>

      <div class="mt-3" v-if="sections.customKyc">
        <div class="form-group">
          <label for="citizenshipStatus">Citizenship Status:</label>
          <select class="form-control" id="citizenshipStatus" v-model="formData.citizenshipStatus">
            <option value="citizen">U.S. Citizen</option>
            <option value="permanentResident">U.S. Permanent Resident</option>
            <option value="nonResident">Non-U.S. Citizen (NRA)</option>
          </select>
        </div>

        <div v-if="formData.citizenshipStatus === 'permanentResident'">
          <div class="form-group">
            <label for="countryOfCitizenship">Country of Citizenship: <span class="text-muted">Default is AF - Afghanistan</span></label>
            <input type="text" class="form-control" id="countryOfCitizenship" v-model="formData.countryOfCitizenship"/>
          </div>
          <div class="form-group">
            <label for="residencyIssueDate">Residency Issue Date: <span class="text-muted">Default is 01/01/2020</span></label>
            <input type="text" class="form-control" id="residencyIssueDate" v-model="formData.residencyIssueDate"/>
          </div>
          <div class="form-group">
            <label for="residencyEntryDate">Residency Date of Entry: <span class="text-muted">Default is 01/01/2020</span></label>
            <input type="text" class="form-control" id="residencyEntryDate" v-model="formData.residencyEntryDate"/>
          </div>
          <div class="form-group">
            <label for="residentNumber">Resident Number: <span class="text-muted">Default is a random 9-digit number</span></label>
            <input type="text" class="form-control" id="residentNumber" v-model="formData.residentNumber"/>
          </div>
          <div class="form-group form-check">
            <input type="checkbox" class="form-check-input" id="residentHasSsn" v-model="formData.residentHasSsn"/>
            <label class="form-check-label" for="residentHasSsn">Permanent resident has an SSN (uncheck for no SSN; SSN field is skipped)</label>
          </div>
        </div>

        <div v-if="formData.citizenshipStatus === 'nonResident'">
          <div class="form-group">
            <label for="countryOfCitizenshipNra">Country of Citizenship: <span class="text-muted">Default is AF - Afghanistan</span></label>
            <input type="text" class="form-control" id="countryOfCitizenshipNra" v-model="formData.countryOfCitizenship"/>
          </div>
        </div>

        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="randomizeIdentity" v-model="formData.randomizeIdentity"/>
          <label class="form-check-label" for="randomizeIdentity">Generate a unique SSN and date of birth for every test run</label>
        </div>
        <div class="form-group">
          <label for="dob">Date of Birth: <span class="text-muted">{{ formData.randomizeIdentity ? 'Generated for each run by default' : 'Default is 12/12/2000' }}</span></label>
          <input type="text" class="form-control" id="dob" v-model="formData.dob" :disabled="formData.randomizeIdentity" :placeholder="formData.randomizeIdentity ? 'Generated for each run' : '12/12/2000'"/>
        </div>
        <div class="form-group">
          <label for="ssn">SSN Number: <span class="text-muted">{{ formData.randomizeIdentity ? 'Generated for each run by default' : 'Default is 666-00-1234' }}</span></label>
          <input type="text" class="form-control" id="ssn" v-model="formData.ssn" :disabled="formData.randomizeIdentity" :placeholder="formData.randomizeIdentity ? 'Generated for each run' : '666-00-1234'"/>
        </div>
        <div class="form-group">
          <label for="address">Street Address: <span class="text-muted">Default is 200201 Test Rd</span></label>
          <input type="text" class="form-control" id="address" v-model="formData.address"/>
        </div>
        <div class="form-group">
          <label for="city">City: <span class="text-muted">Default is Fantasy Island</span></label>
          <input type="text" class="form-control" id="city" v-model="formData.city"/>
        </div>
        <div class="form-group">
          <label for="zip">Zipcode: <span class="text-muted">Default is 60750</span></label>
          <input type="text" class="form-control" id="zip" v-model="formData.zip"/>
        </div>
      </div>

      <div class="form-group">
        <label for="companyType">Company Type:</label>
        <select class="form-control" id="companyType" v-model="formData.companyType" @change="onCompanyTypeChange" required>
          <option value="consumer">Consumer</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div class="form-group">
        <label for="testType">Select Test Type:</label>
        <select class="form-control" id="testType" v-model="formData.testType" required>
          <template v-if="formData.companyType === 'consumer'">
            <option value="loanToKYC">Unsecured Loan To KYC</option>
            <option value="unsecuredTerm">Unsecured Term Loan</option>
            <option value="letterOfCredit">Letter of Credit</option>
            <option value="auto">Used Auto Loan</option>
            <option value="heloc">HELOC (Home Equity Line of Credit)</option>
            <option value="creditCard">Credit Card</option>
          </template>
          <template v-else>
            <option value="businessDeposit">Business Deposit</option>
          </template>
        </select>
      </div>

      <div class="form-group" v-if="formData.companyType === 'business'">
        <a class="d-flex align-items-center" @click="toggleSection('customBusiness')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customBusiness ? '▼' : '▶' }}</span>
          Business
        </a>
      </div>

      <div class="mt-3 business-card" v-if="formData.companyType === 'business' && sections.customBusiness">
        <div class="business-card__heading">
          <strong>Business Details</strong>
          <span>Saved as your local business defaults</span>
        </div>
        <div class="form-group form-check">
          <input type="checkbox" class="form-check-input" id="randomizeBusinessIdentity" v-model="formData.randomizeBusinessIdentity"/>
          <label class="form-check-label" for="randomizeBusinessIdentity">Generate a unique EIN and incorporation date for every test run</label>
        </div>
        <div class="form-group">
          <label for="businessName">Business Name: <span class="text-muted">Default is Acme Test LLC</span></label>
          <input type="text" class="form-control" id="businessName" v-model="formData.businessName"/>
        </div>
        <div class="form-group">
          <label for="businessEntityType">Entity Type:</label>
          <select class="form-control" id="businessEntityType" v-model="formData.businessEntityType">
            <option value="llc">LLC</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
            <option value="sole proprietorship">Sole Proprietorship</option>
          </select>
        </div>
        <div class="form-group">
          <label for="businessEin">EIN: <span class="text-muted">{{ formData.randomizeBusinessIdentity ? 'Generated for each run by default' : 'Default is 12-3456789' }}</span></label>
          <input type="text" class="form-control" id="businessEin" v-model="formData.businessEin" :disabled="formData.randomizeBusinessIdentity" :placeholder="formData.randomizeBusinessIdentity ? 'Generated for each run' : '12-3456789'"/>
        </div>
        <div class="form-group">
          <label for="businessPhone">Business Phone: <span class="text-muted">Default is (234) 242-3423</span></label>
          <input type="tel" inputmode="numeric" maxlength="14" class="form-control" id="businessPhone" :value="formData.businessPhone" @input="formatPhoneField('businessPhone', $event)"/>
        </div>
        <div class="form-group">
          <label for="businessIncorporationDate">Incorporation Date: <span class="text-muted">{{ formData.randomizeBusinessIdentity ? 'Generated for each run by default' : 'Default is 01/01/2010' }}</span></label>
          <input type="text" class="form-control" id="businessIncorporationDate" v-model="formData.businessIncorporationDate" :disabled="formData.randomizeBusinessIdentity" :placeholder="formData.randomizeBusinessIdentity ? 'Generated for each run' : '01/01/2010'"/>
        </div>
        <div class="form-group">
          <label for="businessAddress">Business Address: <span class="text-muted">Default is 200201 Test Rd</span></label>
          <input type="text" class="form-control" id="businessAddress" v-model="formData.businessAddress"/>
        </div>
        <div class="form-group">
          <label for="businessCity">Business City: <span class="text-muted">Default is Fantasy Island</span></label>
          <input type="text" class="form-control" id="businessCity" v-model="formData.businessCity"/>
        </div>
        <div class="form-group">
          <label for="businessState">Business State: <span class="text-muted">Default is NC (2-letter code)</span></label>
          <input type="text" class="form-control" id="businessState" v-model="formData.businessState"/>
        </div>
        <div class="form-group">
          <label for="businessZip">Business Zip: <span class="text-muted">Default is 60750</span></label>
          <input type="text" class="form-control" id="businessZip" v-model="formData.businessZip"/>
        </div>

        <div class="ownership-tree">
          <div class="ownership-tree__heading">Ownership & Related Parties</div>
          <div class="ownership-tree__branch">
            <strong>Applicant / Beneficial Owner</strong>
            <span>Primary applicant details are configured in the Applicant card above.</span>
          </div>
          <div class="form-group ownership-tree__content">
            <label for="businessOwnerPercentage">Applicant ownership percentage:</label>
            <input type="number" min="0" max="100" step="1" class="form-control" id="businessOwnerPercentage" v-model="formData.businessOwnerPercentage"/>
          </div>

          <div class="ownership-tree__content">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <strong>Additional Related Parties / Beneficial Owners</strong>
              <button type="button" class="btn btn-sm btn-outline-primary" @click="addRelatedParty">Add Related Party</button>
            </div>
            <p class="text-muted small">Each added party is created as an individual beneficial owner and must own at least 20%.</p>

            <div v-for="(party, index) in formData.relatedParties" :key="party.id" class="related-party-card">
              <div class="related-party-card__header">
                <button type="button" class="related-party-card__toggle" @click="toggleRelatedParty(party.id)">
                  {{ partyExpanded[party.id] === false ? '▶' : '▼' }}
                  Related Party {{ index + 1 }} — {{ party.firstName || 'New' }} {{ party.lastName || 'Owner' }}
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger" @click="removeRelatedParty(index)">Remove</button>
              </div>
              <div v-if="partyExpanded[party.id] !== false" class="related-party-card__body">
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyFirstName-${party.id}`">First Name</label>
                    <input :id="`relatedPartyFirstName-${party.id}`" type="text" class="form-control" v-model="party.firstName" required/>
                  </div>
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyLastName-${party.id}`">Last Name</label>
                    <input :id="`relatedPartyLastName-${party.id}`" type="text" class="form-control" v-model="party.lastName" required/>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyTitle-${party.id}`">Title</label>
                    <input :id="`relatedPartyTitle-${party.id}`" type="text" class="form-control" v-model="party.title" placeholder="Owner"/>
                  </div>
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyOwnership-${party.id}`">Ownership %</label>
                    <input :id="`relatedPartyOwnership-${party.id}`" type="number" min="20" max="100" step="1" class="form-control" v-model.number="party.ownershipPercentage" required/>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyEmail-${party.id}`">nCino Email</label>
                    <input :id="`relatedPartyEmail-${party.id}`" type="text" class="form-control" v-model="party.email" placeholder="nathaniel.lee@ncino.com"/>
                    <small class="form-text text-muted">Leave blank to use the primary nCino email with this party’s name in the modifier.</small>
                  </div>
                  <div class="form-group col-md-6">
                    <label :for="`relatedPartyPhone-${party.id}`">Phone</label>
                    <input :id="`relatedPartyPhone-${party.id}`" type="tel" inputmode="numeric" maxlength="14" class="form-control" :value="party.phone" @input="formatRelatedPartyPhone(party, $event)" placeholder="(234) 242-3423"/>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="formData.relatedParties.length" class="ownership-total" :class="{'text-danger': ownershipTotal > 100}">
              Total ownership: {{ ownershipTotal }}% <span v-if="ownershipTotal > 100">— must not exceed 100%</span>
            </p>
          </div>
        </div>
      </div>

      <div class="form-group">
        <a class="d-flex align-items-center" @click="toggleSection('prematureStop')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.prematureStop ? '▼' : '▶' }}</span>
          Stop Flow Early
        </a>
      </div>

      <div class="mt-3" v-if="sections.prematureStop">
        <label for="prematureStop">Select Stop Page:</label>
        <select class="form-control" id="prematureStop" v-model="formData.prematureStop">
          <option value="">Don't Stop Early</option>
          <option value="login">Login Page</option>
          <option value="productSelection">Product Selection Page</option>
          <template v-if="formData.companyType === 'consumer'">
            <option value="eligibility">Eligibility Page</option>
            <option value="kyc">KYC Page</option>
            <option value="income">Income Page</option>
            <option value="demographics">Demographics Page</option>
            <option value="coApp">Coapp Info Page</option>
            <option value="loanDetails">Loan Details Page</option>
            <option value="loanNeeds">Loan Needs Page</option>
          </template>
          <template v-else>
            <option value="businessInfo">Business Info Page</option>
            <option value="businessYourInfo">Business Your Info Page</option>
            <option value="businessYourInfoAddress">Business Your Info Address Page</option>
          </template>
        </select>
      </div>

      <div><strong>* URL Priority is as follows: Batch Urls -> Custom Url.</strong></div>
      <div>Leave the higher priority field empty to use the lower priority field.</div>

      <div class="form-group">
        URL(s)
        <div class="mt-3">
          <b-tabs content-class="mt-3">
            <b-tab title="Batch URLs" active>
              <div class="form-group">
                <label for="batchUrls">Batch Urls:</label>
                <textarea
                    class="form-control"
                    id="batchUrls"
                    v-model="formData.batchUrls"
                    rows="3"
                    placeholder="Unsecured LOC	https://custom6.omni-qa.ncino.com/homehub/prefill_form/consumer?product_id=a0uao0000009SSJAA2
Automobile	https://custom6.omni-qa.ncino.com/homehub/prefill_form/consumer?product_id=a0uao0000009SSCAA2
Unsecured Loan	https://custom6.omni-qa.ncino.com/homehub/prefill_form/consumer?product_id=a0uao0000009SSBAA2"
                ></textarea>
              </div>
            </b-tab>
            <b-tab title="Custom URL">
              <div class="form-group">
                <label for="customUrl">Custom Url:</label>
                <input
                    type="text"
                    class="form-control"
                    id="customUrl"
                    v-model="formData.customUrl"
                    placeholder="https://custom6.omni-qa.ncino.com/homehub/prefill_form/consumer?product_id=a0uao0000009SSJAA2"
                />
              </div>
            </b-tab>
          </b-tabs>
        </div>

      </div>


      <button type="submit" class="btn btn-primary btn-block run-button" :disabled="isRunning">
        <span v-if="isRunning" class="button-spinner" aria-hidden="true"></span>
        {{ isRunning ? 'Test Running…' : 'Run Tests' }}
      </button>
    </form>

    <pre id="output" class="mt-4">{{ output }}</pre>
  </div>
</template>

<script>
const serverUrl = process.env.VUE_APP_SERVER_URL || 'http://localhost:4001';
const getDefaultFormData = () => ({
  email: '',
  password: '',
  companyType: 'consumer',
  testType: 'loanToKYC',
  firstName: 'John',
  lastName: 'Pass',
  phone: '(234) 242-3423',
  citizenshipStatus: 'citizen',
  countryOfCitizenship: 'AF - Afghanistan',
  residencyIssueDate: '01/01/2020',
  residencyEntryDate: '01/01/2020',
  residentNumber: '',
  residentHasSsn: true,
  dob: '',
  ssn: '',
  randomizeIdentity: true,
  address: '200201 Test Rd',
  city: 'Fantasy Island',
  zip: '60750',
  isPrefill: false,
  hasCoApplicant: false,
  coappFirstName: 'NateCoapp',
  coappLastName: 'Pass',
  coappPhone: '(111) 111-1111',
  coappEmail: '',
  failEligibility: false,
  skipEligibility: false,
  customUrl: '',
  batchUrls: '',
  prematureStop: '',
  businessName: 'Acme Test LLC',
  businessEntityType: 'llc',
  businessEin: '',
  businessPhone: '(234) 242-3423',
  businessIncorporationDate: '',
  randomizeBusinessIdentity: true,
  businessAddress: '200201 Test Rd',
  businessCity: 'Fantasy Island',
  businessState: 'NC',
  businessZip: '60750',
  businessOwnerPercentage: '100',
  relatedParties: []
});

export default {
  data() {
    return {
      formData: getDefaultFormData(),
      sections: {
        customUserInfo: true,
        customCoApp: false,
        customKyc: true,
        customBusiness: false,
        prematureStop: false
      },
      output: '',
      hasSavedTestData: false,
      isSavingDefaults: false,
      isRunning: false,
      runStatus: {},
      statusTimer: null,
      partyExpanded: {}
    }
  },
  computed: {
    ownershipTotal() {
      return Number(this.formData.businessOwnerPercentage || 0) + this.formData.relatedParties
        .reduce((total, party) => total + Number(party.ownershipPercentage || 0), 0);
    }
  },
  watch: {
    'formData.randomizeIdentity'(isRandomized) {
      if (!isRandomized) {
        if (!this.formData.dob) this.formData.dob = '12/12/2000';
        if (!this.formData.ssn) this.formData.ssn = '666-00-1234';
      }
    },
    'formData.randomizeBusinessIdentity'(isRandomized) {
      if (!isRandomized) {
        if (!this.formData.businessEin) this.formData.businessEin = '12-3456789';
        if (!this.formData.businessIncorporationDate) this.formData.businessIncorporationDate = '01/01/2010';
      }
    }
  },
  mounted() {
    this.loadTestDataDefaults();
    this.refreshTestStatus();
    this.statusTimer = window.setInterval(this.refreshTestStatus, 2000);
  },
  beforeDestroy() {
    window.clearInterval(this.statusTimer);
  },
  methods: {
    toggleSection(section) {
      if (this.isRunning) return;
      this.sections[section] = !this.sections[section];
    },
    withRelatedPartyId(party = {}) {
      return Object.assign({
        id: `related-party-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: this.formData.phone,
        ownershipPercentage: 20
      }, party);
    },
    addRelatedParty() {
      const party = this.withRelatedPartyId();
      this.formData.relatedParties.push(party);
      this.$set(this.partyExpanded, party.id, true);
    },
    removeRelatedParty(index) {
      const [party] = this.formData.relatedParties.splice(index, 1);
      if (party) this.$delete(this.partyExpanded, party.id);
    },
    toggleRelatedParty(partyId) {
      this.$set(this.partyExpanded, partyId, this.partyExpanded[partyId] === false);
    },
    formatPhoneNumber(value) {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      if (digits.length < 4) return digits;
      if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    },
    formatPhoneField(field, event) {
      const formattedPhone = this.formatPhoneNumber(event.target.value);
      event.target.value = formattedPhone;
      this.formData[field] = formattedPhone;
    },
    formatRelatedPartyPhone(party, event) {
      const formattedPhone = this.formatPhoneNumber(event.target.value);
      event.target.value = formattedPhone;
      party.phone = formattedPhone;
    },
    onCompanyTypeChange() {
      this.formData.testType = this.formData.companyType === 'business' ? 'businessDeposit' : 'loanToKYC';
      this.formData.prematureStop = '';
    },
    async loadTestDataDefaults() {
      try {
        const response = await fetch(serverUrl + '/config/test-data');
        if (!response.ok) throw new Error('Unable to load local defaults');
        const config = await response.json();
        this.hasSavedTestData = config.configured;
        this.formData = Object.assign({}, this.formData, config.data);
        this.formData.relatedParties = this.formData.relatedParties.map((party) => this.withRelatedPartyId(party));
      } catch (error) {
        this.output = `Unable to load local defaults: ${error.message}`;
      }
    },
    async saveTestDataDefaults() {
      this.isSavingDefaults = true;
      try {
        const response = await fetch(serverUrl + '/config/test-data', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({data: this.formData})
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to save local defaults');
        this.hasSavedTestData = true;
        this.output = result.message;
      } catch (error) {
        this.output = `Error: ${error.message}`;
      } finally {
        this.isSavingDefaults = false;
      }
    },
    applyRunStatus(status) {
      const wasRunning = this.isRunning;
      this.isRunning = Boolean(status.isRunning);
      this.runStatus = status.run || {};
      if (wasRunning && !this.isRunning && this.runStatus.status) {
        this.output = `Test run ${this.runStatus.status}.`;
      }
    },
    async refreshTestStatus() {
      try {
        const response = await fetch(serverUrl + '/test-status');
        if (response.ok) this.applyRunStatus(await response.json());
      } catch (_error) {
        // The normal run request will show a connection error if the server is unavailable.
      }
    },
    getBasePayload() {
      return {
        email: this.formData.email,
        password: this.formData.password,
        testType: this.formData.testType,
        isPrefill: this.formData.isPrefill,
        hasCoApplicant: this.formData.hasCoApplicant,
        coappFirstName: this.formData.coappFirstName,
        coappLastName: this.formData.coappLastName,
        coappPhone: this.formData.coappPhone,
        coappEmail: this.formData.coappEmail,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        phone: this.formData.phone,
        citizenshipStatus: this.formData.citizenshipStatus,
        countryOfCitizenship: this.formData.countryOfCitizenship,
        residencyIssueDate: this.formData.residencyIssueDate,
        residencyEntryDate: this.formData.residencyEntryDate,
        residentNumber: this.formData.residentNumber,
        residentHasSsn: this.formData.residentHasSsn,
        dob: this.formData.randomizeIdentity ? '' : this.formData.dob,
        ssn: this.formData.randomizeIdentity ? '' : this.formData.ssn,
        randomizeIdentity: this.formData.randomizeIdentity,
        address: this.formData.address,
        city: this.formData.city,
        zip: this.formData.zip,
        failEligibility: this.formData.failEligibility,
        skipEligibility: this.formData.skipEligibility,
        prematureStop: this.formData.prematureStop,
        businessName: this.formData.businessName,
        businessEntityType: this.formData.businessEntityType,
        businessEin: this.formData.randomizeBusinessIdentity ? '' : this.formData.businessEin,
        businessPhone: this.formData.businessPhone,
        businessIncorporationDate: this.formData.randomizeBusinessIdentity ? '' : this.formData.businessIncorporationDate,
        randomizeBusinessIdentity: this.formData.randomizeBusinessIdentity,
        businessAddress: this.formData.businessAddress,
        businessCity: this.formData.businessCity,
        businessState: this.formData.businessState,
        businessZip: this.formData.businessZip,
        businessOwnerPercentage: this.formData.businessOwnerPercentage,
        relatedParties: this.formData.relatedParties.map((party) => {
          const payloadParty = Object.assign({}, party);
          delete payloadParty.id;
          return payloadParty;
        })
      };
    },
    async runTests() {
      if (this.isRunning) {
        this.output = 'A test run is already active. Wait for it to finish before starting another one.';
        return;
      }
      if (this.formData.companyType === 'business' && this.ownershipTotal > 100) {
        this.output = 'Applicant and related-party ownership cannot exceed 100%.';
        return;
      }
      try {
        if (this.formData.batchUrls.trim() !== '') {
          const urlPattern = /(https?:\/\/\S+)/g;
          const urls = this.formData.batchUrls.match(urlPattern);

          const payload = this.getBasePayload();
          this.$log.info('payload', payload);
          payload.urls = urls;

          const response = await fetch(serverUrl + "/run-tests-batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          this.applyRunStatus(result);
          this.output = response.ok ? result.message : `Error: ${result.error || 'Unable to start tests'}`;
        } else {
          const payload = this.getBasePayload();
          this.$log.info('payload', payload);

          payload.environmentType = this.formData.customUrl;

          const response = await fetch(serverUrl + "/run-tests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const result = await response.json();
          this.applyRunStatus(result);
          this.output = response.ok ? result.message : `Error: ${result.error || 'Unable to start tests'}`;
        }
      } catch (error) {
        this.output = `Error: ${error.message}`;
      }
    }
  }
}
</script>

<style>
body {
  display: block;
  padding-top: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.setup-card,
.run-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
}

.setup-card {
  margin-top: 1.5rem;
  background: #edf5ff;
  border: 1px solid #b8d7fa;
}

.setup-card--saved {
  background: #edf9f1;
  border-color: #b7dfc3;
}

.setup-card p,
.run-status span {
  color: #4a5568;
}

.setup-save-button {
  flex: 0 0 auto;
}

.run-status {
  margin-top: 1rem;
  color: #ffffff;
  background: linear-gradient(110deg, #0759aa, #007bff, #0759aa);
  background-size: 200% 100%;
  box-shadow: 0 4px 14px rgba(0, 123, 255, 0.28);
  animation: status-shimmer 2.4s linear infinite;
}

.run-status > div {
  flex: 1;
}

.run-status strong,
.run-status span {
  display: block;
  color: #ffffff;
}

.run-status__spinner,
.button-spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 3px solid rgba(255, 255, 255, 0.38);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.button-spinner {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  vertical-align: -0.125rem;
  border-width: 2px;
}

.run-status__pulse {
  padding: 0.2rem 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  animation: pulse 1.25s ease-in-out infinite;
}

.run-button:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.applicant-card,
.business-card,
.ownership-tree {
  padding: 1rem;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  background: #fbfdff;
}

.ownership-tree {
  margin-top: 1.5rem;
  border-left: 4px solid #4e8ccf;
}

.business-card__heading,
.ownership-tree__heading {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.business-card__heading strong,
.ownership-tree__heading {
  color: #1f4d7b;
  font-size: 1.1rem;
}

.business-card__heading span {
  color: #667085;
  font-size: 0.9rem;
}

.ownership-tree__heading {
  font-weight: 600;
}

.ownership-tree__branch {
  display: flex;
  flex-direction: column;
  padding-left: 1rem;
  border-left: 2px solid #a6c8eb;
}

.ownership-tree__branch span {
  color: #667085;
  font-size: 0.9rem;
}

.ownership-tree__content {
  margin-top: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #d3e4f5;
}

.related-party-card {
  margin-top: 0.75rem;
  border: 1px solid #cbddeb;
  border-radius: 6px;
  background: #ffffff;
}

.related-party-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  background: #f2f8fd;
}

.related-party-card__toggle {
  flex: 1;
  padding: 0;
  color: #1f4d7b;
  text-align: left;
  font-weight: 600;
  background: transparent;
  border: 0;
}

.related-party-card__body {
  padding: 1rem;
}

.ownership-total {
  margin-top: 0.75rem;
  font-weight: 600;
}

#testForm {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group a.d-flex {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.mt-3 {
  margin-top: 1.5rem !important;
}

button[type="submit"] {
  margin-top: 2rem;
}

.form-group a.d-flex:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 5px;
  margin-left: -5px;
  transition: background-color 0.2s ease;
}

.form-group a.d-flex:hover span {
  color: #007bff;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  50% { transform: scale(1.06); opacity: 0.72; }
}

@keyframes status-shimmer {
  to { background-position: -200% 0; }
}

@media (max-width: 575px) {
  .setup-card,
  .run-status {
    align-items: flex-start;
    flex-direction: column;
  }
}

</style>
