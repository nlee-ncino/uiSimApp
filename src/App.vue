<template>
  <div class="container">
    <h1 class="text-center">Create Sample Consumer Loan</h1>
    <form id="testForm" class="mt-4" @submit.prevent="runTests">
      <div class="form-group">
        <label for="email">Email:
          <span class="text-muted"> Default is a random generated string + @gmail.com </span>
        </label>
        <input type="text" class="form-control" id="email" v-model="formData.email"/>
      </div>

      <div class="form-group">
        <label for="password">Password: <span class="text-muted">Default is RandomWords123 </span></label>
        <input type="text" class="form-control" id="password" v-model="formData.password"/>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="hasCoApplicant" v-model="formData.hasCoApplicant"/>
        <label class="form-check-label" for="hasCoApplicant">Add Co-Applicant</label>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="failEligibility" v-model="formData.failEligibility"/>
        <label class="form-check-label" for="failEligibility">Fail eligibility</label>
      </div>

      <div class="form-group form-check">
        <input type="checkbox" class="form-check-input" id="isPrefill" v-model="formData.isPrefill"/>
        <label class="form-check-label" for="isPrefill">
          Existing User who has completed KYC (this will ignore custom user and kyc changes)
        </label>
      </div>

      <!-- User Info Section -->
      <div class="form-group">
        <a class="d-flex align-items-center" @click="toggleSection('customUserInfo')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customUserInfo ? '▼' : '▶' }}</span>
          Customize User Info
        </a>
      </div>

      <div class="mt-3" v-if="sections.customUserInfo">
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
          <input type="text" class="form-control" id="phone" v-model="formData.phone"/>
        </div>
      </div>

      <!-- KYC Section -->
      <div class="form-group">
        <a class="d-flex align-items-center" @click="toggleSection('customKyc')"
           style="color: black; text-decoration: none; cursor: pointer;">
          <span class="mr-2">{{ sections.customKyc ? '▼' : '▶' }}</span>
          Customize KYC (Know Your Customer Information)
        </a>
      </div>

      <div class="mt-3" v-if="sections.customKyc">
        <div class="form-group">
          <label for="dob">Date of Birth: <span class="text-muted">Default is 12/12/2000</span></label>
          <input type="text" class="form-control" id="dob" v-model="formData.dob"/>
        </div>
        <div class="form-group">
          <label for="ssn">SSN Number: <span class="text-muted">Default is 666-00-1234</span></label>
          <input type="text" class="form-control" id="ssn" v-model="formData.ssn"/>
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
        <label for="testType">Select Test Type:</label>
        <select class="form-control" id="testType" v-model="formData.testType" required>
          <option value="loanToKYC">Unsecured Loan To KYC</option>
          <option value="unsecuredTerm">Unsecured Term Loan</option>
          <option value="letterOfCredit">Letter of Credit</option>
          <option value="auto">Used Auto Loan</option>
          <option value="heloc">HELOC (Home Equity Line of Credit)</option>
          <option value="creditCard">Credit Card</option>
        </select>
      </div>

      <div><strong>* URL Priority is as follows: Batch Urls -> Custom Url -> Environment.</strong></div>
      <div>Leave the higher priority fields empty to use the lower priority fields.</div>

      <!-- URL Section -->
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
            <b-tab title="Environment">
              <div class="form-group">
                <label for="environmentType">Default Environment:</label>
                <select
                    class="form-control"
                    id="environmentType"
                    v-model="formData.environmentType"
                    required
                >
                  <option value="local" selected>Local Environment to Local Salesforce</option>
                  <option value="localQA">Local Environment to QA Salesforce</option>
                  <option value="omniQA">Omni QA (CB22) Environment</option>
                  <option value="feature">Feature Environment (please enter pr number on next tab if using this)
                  </option>
                </select>
              </div>
            </b-tab>
            <b-tab title="PR Number">
              <div class="form-group">
                <label for="prNumber">PR Number: (Enter when selecting feature environment or nothing happens ->
                  ex.1120)</label>
                <input type="text" class="form-control" id="prNumber" v-model="formData.prNumber"/>
              </div>
            </b-tab>
          </b-tabs>
        </div>

      </div>


      <button type="submit" class="btn btn-primary btn-block">
        Run Tests
      </button>
    </form>

    <pre id="output" class="mt-4">{{ output }}</pre>
  </div>
</template>

<script>
const serverUrl = process.env.VUE_APP_SERVER_URL || 'http://localhost:4001';
export default {
  data() {
    return {
      formData: {
        email: '',
        password: '',
        testType: 'loanToKYC',
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        ssn: '',
        address: '',
        city: '',
        zip: '',
        isPrefill: false,
        hasCoApplicant: false,
        failEligibility: false,
        environmentType: 'local',
        customUrl: '',
        batchUrls: '',
        prNumber: ''
      },
      sections: {
        customUserInfo: false,
        customKyc: false
      },
      output: ''
    }
  },
  methods: {
    toggleSection(section) {
      this.sections[section] = !this.sections[section];
    },
    getBasePayload() {
      return {
        email: this.formData.email,
        password: this.formData.password,
        testType: this.formData.testType,
        isPrefill: this.formData.isPrefill,
        hasCoApplicant: this.formData.hasCoApplicant,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
        phone: this.formData.phone,
        dob: this.formData.dob,
        ssn: this.formData.ssn,
        address: this.formData.address,
        city: this.formData.city,
        zip: this.formData.zip,
        prNumber: this.formData.prNumber,
        failEligibility: this.formData.failEligibility
      };
    },
    async runTests() {
      try {
        // Check if batch URLs are provided
        if (this.formData.batchUrls.trim() !== '') {
          const urlPattern = /https?:\/\/\S+/g;
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

          this.output = await response.text();
        } else {
          // Use customUrl if it's not empty, otherwise use the dropdown value
          const environmentType =
              this.formData.customUrl.trim() !== ''
                  ? this.formData.customUrl
                  : this.formData.environmentType;

          const payload = this.getBasePayload();
          this.$log.info('payload', payload);

          payload.environmentType = environmentType;

          const response = await fetch(serverUrl + "/run-tests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          this.output = await response.text();
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

#testForm {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem; /* Increase from default */
}

/* Add more space before section toggles */
.form-group a.d-flex {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Add more space between sections */
.mt-3 {
  margin-top: 1.5rem !important;
}

/* Add more space before the submit button */
button[type="submit"] {
  margin-top: 2rem;
}

/* Add hover effect to toggleable sections */
.form-group a.d-flex:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 5px;
  margin-left: -5px;
  transition: background-color 0.2s ease;
}

/* Add a subtle color change to the toggle indicator on hover */
.form-group a.d-flex:hover span {
  color: #007bff;
}

</style>