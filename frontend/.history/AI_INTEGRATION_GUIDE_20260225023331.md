# MedRoster UI Improvements & AI Integration Guide

## ✨ Stable UI Improvements Made

### 1. **Enhanced Dashboard Layout**
   - ✅ Better organized sections with clear hierarchy
   - ✅ Role-based UI rendering with `PermissionGuard` component
   - ✅ Improved visual hierarchy with emojis and better typography
   - ✅ Material-UI `Table` component replacing HTML tables
   - ✅ Better loading state with `CircularProgress`
   - ✅ Color-coded role badges with role-specific styling

### 2. **Role-Based UI Sections**

#### Admin Features:
- 📊 Manage Departments (Create, View, Edit)
- 🕐 Manage Shifts (Create, Update, Delete)
- 👥 View & Manage Staff Assignments
- 🤖 AI Scheduling Suggestions
- 📢 Voice Announcements (11 Labs)

#### Manager Features:
- 🕐 Manage Shifts
- 👥 View & Manage Assignments
- 🤖 AI Insights & Recommendations
- 📊 View Reports

#### Doctor Features:
- 📋 View Shifts
- 👥 View Assignments
- 📝 Request Schedule Changes
- 📊 View Workload Metrics

#### Nurse Features:
- 📅 View Assignments
- 📝 Request Changes
- 📋 View Schedule

#### Staff Features:
- 📅 View Assigned Shifts
- 📋 View Schedule

---

## 🤖 AI Integration Fields & Use Cases

### 1. **OpenAI Integration Points**

#### **A. Scheduling Suggestions** (`manage_departments` permission)
```
Endpoint: POST /ai/schedule-suggestions
Input: shift_id
Output: { suggested_users: number[], reasoning: string, confidence: number }
Use Case: When creating a shift, recommend best staff based on availability, skills, and workload
Button Location: AI Features Section (top of dashboard)
```

- Analyzes staff skills and availability
- Considers workload balance across roles
- Suggests optimal staff-to-shift matching
- Confidence score for suggestions

#### **B. Announcement Generation** (`manage_departments` permission)
```
Endpoint: POST /ai/generate-announcement
Input: message (what you want to announce)
Output: Enhanced, professional announcement text
Use Case: Admin creates professional shift announcements automatically
```

- Generates professional shift announcements
- Standardizes communication format
- Adds contextual details (dates, times, locations)

#### **C. Workload Analysis** (`manage_departments` permission)
```
Endpoint: POST /ai/analyze-workload
Input: department_id
Output: { analysis: string, recommendations: [], risk_factors: [] }
Use Case: Identify overworked staff and suggest balance improvements
```

- Analyzes staff workload distribution
- Identifies burnout risks
- Suggests load balancing strategies
- Recommends hiring needs

---

### 2. **11 Labs TTS Integration Points**

#### **A. Voice Announcements** (`manage_departments` permission)
```
Endpoint: POST /ai/text-to-speech
Input: { message: string, language: string }
Output: audio blob (MP3)
Use Case: Convert shift announcements to voice for staff notifications
Button Location: "Announce via Voice (11 Labs)" Button
```

**Possible Announcement Types:**
- **Shift Changes**: "Shift update: Dr. Smith's surgery has been rescheduled to 3 PM"
- **Emergency Calls**: "Emergency staffing request for Emergency Department"
- **Schedule Reminders**: "Reminder: Your night shift begins at 9 PM"
- **Role-Specific Announcements**: Different voices/tones for different roles

**Role-Based Voice Features:**
- **Admin/Manager**: Broadcast announcements to all staff
- **Doctor**: Request emergency support announcements
- **Nurse**: Shift change notifications
- **Staff**: Personal shift reminders via voice

---

### 3. **Implementation Fields in Dashboard**

#### Current Implementation:
```tsx
// AI Section (visible for admin with manage_departments permission)
<PermissionGuard permission="manage_departments">
  <Paper sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
    <Typography variant="h6">🤖 AI Features</Typography>
    
    {/* Button 1: Scheduling Suggestions */}
    <Button onClick={handleAISuggestions}>
      Get Scheduling Suggestions
    </Button>
    
    {/* Button 2: Text-to-Speech */}
    <Button onClick={handleTextToSpeech}>
      Announce via Voice (11 Labs)
    </Button>
    
    {/* Display AI Response */}
    {aiSuggestion && <Alert>{aiSuggestion}</Alert>}
  </Paper>
</PermissionGuard>
```

#### Where to Add More AI Features:

**1. Shift Creation Dialog** - Add AI suggestions:
```tsx
// When admin creates a shift
<Button onClick={() => getSchedulingSuggestions(newShift)}>
  🤖 Get Staff Suggestions
</Button>
```

**2. Staff Table** - Add workload analysis per person:
```tsx
// In Staff Users Section
<TableCell>
  <Button onClick={() => analyzeStaffWorkload(userId)}>
    Analyze Workload
  </Button>
</TableCell>
```

**3. Assignment Management** - Add voice notifications:
```tsx
// When assigning staff to shift
<Button onClick={() => announceAssignment(assignment)}>
  📢 Notify via Voice
</Button>
```

**4. Department View** - Add team analytics:
```tsx
// In Departments Section
<Button onClick={() => analyzeDepworkload(deptId)}>
  📊 AI Analytics
</Button>
```

---

## 📋 New API Methods Added

### Available AI APIs:
```typescript
aiAPI.getSchedulingSuggestions(shiftId)      // OpenAI - shift suggestions
aiAPI.generateAnnouncement(message)            // OpenAI - generate announcements
aiAPI.textToSpeech(message, language)         // 11 Labs - voice output
aiAPI.getRecommendations(departmentId)        // OpenAI - recommendations
aiAPI.analyzeWorkload(departmentId)           // OpenAI - workload analysis
```

### Permission Guards:
```typescript
// For AI Features
'manage_departments'   // Admin only
'ai_scheduling'        // Admin, Manager
'ai_insights'          // Admin, Manager
'ai_announcements'     // Admin only
```

---

## 💡 Suggested AI Feature Roadmap

### Phase 1 (Current):
- ✅ Scheduling suggestions
- ✅ Voice announcements (11 Labs)

### Phase 2:
- [ ] Automatic shift recommendations based on availability
- [ ] Workload monitoring & alerts
- [ ] Predictive staffing needs
- [ ] Automated announcement generation

### Phase 3:
- [ ] Staff performance analytics (OpenAI)
- [ ] Vacation/sick leave predictions
- [ ] Budget optimization recommendations
- [ ] Multi-language support for voice

---

## 🔒 Role-Based Permission Matrix

| Feature | Admin | Manager| Doctor | Nurse | Staff |
|---------|-------|--------|--------|-------|-------|
| Manage Departments | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Shifts | ✅ | ✅ | ❌ | ❌ | ❌ |
| AI Scheduling | ✅ | ✅ | ❌ | ❌ | ❌ |
| AI Announcements | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Assignments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Assignments | ✅ | ✅ | ❌ | ❌ | ❌ |
| Request Changes | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Quick Start: Adding New AI Features

1. **Create the backend endpoint** in your FastAPI server with OpenAI/11 Labs integration
2. **Add the API method** in [src/api/index.ts](src/api/index.ts):
   ```typescript
   export const aiAPI = {
     myNewFeature: (params) => client.post('/ai/my-endpoint', params),
   };
   ```
3. **Use it in components** with the `PermissionGuard`:
   ```tsx
   <PermissionGuard permission="required_permission">
     <Button onClick={() => aiAPI.myNewFeature(data)}>
       🤖 Feature Name
     </Button>
   </PermissionGuard>
   ```

---

## 📁 New Files Created

- `src/types/index.ts` - Type definitions for roles and AI responses
- `src/utils/roleUtils.ts` - Role-based utilities and styling
- `src/components/PermissionGuard.tsx` - Role-based component rendering
- Updated `src/pages/DashboardPage.tsx` - Stable UI with AI integration

