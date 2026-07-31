// OpenSnipping - Screenshot and Annotation Tool
import { initI18n, t, applyTranslations, setupLanguagePicker } from './lib/i18n.js';

// ============ Translations ============
const TRANSLATIONS = {
	en: {
		// Page title
		pageTitle: 'OpenSnipping',

		// Toolbar buttons
		newSnip: 'New',
		newSnipTitle: 'New Snip',
		delay: 'Delay',
		delayTitle: 'Set delay before capture',
		copyTitle: 'Copy',
		saveTitle: 'Save',
		saveOptionsTitle: 'Save Options',
		penTitle: 'Pen',
		rectTitle: 'Rectangle',
		styleTitle: 'Stroke style',
		styleColor: 'Color',
		styleWidth: 'Width',
		styleFillRect: 'Fill rectangle',
		eraserTitle: 'Eraser',
		undoTitle: 'Undo',
		redoTitle: 'Redo',
		languageTitle: 'Language',

		// Delay menu
		noDelay: 'No Delay',
		oneSecond: '1 Second',
		twoSeconds: '2 Seconds',
		threeSeconds: '3 Seconds',
		fourSeconds: '4 Seconds',
		fiveSeconds: '5 Seconds',
		delayFormat: 'Delay ({0}s)',
		newSnipFormat: 'New Snip ({0}s)',
		newFormat: 'New ({0}s)',

		// Save menu
		defaultSave: 'Default',
		saveAs: 'Save As...',

		// Status messages
		autoDelayNotice: 'Auto-delaying 5s for entire screen',
		cropModeHint: 'Click and drag to select area to crop',
		penModeHint: 'To crop image, click Pen again to exit annotation mode',
		rectModeHint: 'Click and drag to draw a rectangle',

		// Hero/Drop zone
		newSnipBtn: 'New Snip',
		heroOr: 'or',
		dropHintMain: 'Drop image here, paste, or click to open',
		dropHintSub: 'Supports JPG, PNG, GIF, and WebP',

		// Confirm dialogs
		confirmLeave: 'You have unsaved changes. Are you sure you want to leave?',
		confirmNew: 'You have unsaved changes. Are you sure you want to start a new snip?',
		confirmExit: 'You have unsaved changes. Are you sure you want to exit?',

		// Language switcher
		switchToEnglish: 'Switch to English',
		switchToChinese: '切换到中文',

		// Video recording
		record: 'Record',
		recordTitle: 'Record Screen',
		recording: 'Recording',
		stopRecording: 'Stop Recording',
		discard: 'Discard',
		saveVideo: 'Save Video'
	}
};

// Initialize i18n
initI18n({
	storageKey: 'opensnipping.lang.v1',
	defaultLang: 'en',
	translations: TRANSLATIONS
});

// ============ Constants ============
const CANVAS_PADDING_PX = 0;
const DEFAULT_PEN_COLOR = '#d10000';
const DEFAULT_PEN_WIDTH = 4;
const POST_PICKER_CAPTURE_DELAY_MS = 250;

// ============ Mutable style state (color/width/fill) ============
// Each new stroke captures these at pointer-down time; existing strokes keep their own.
let currentColor = DEFAULT_PEN_COLOR;
let currentWidth = DEFAULT_PEN_WIDTH;
let rectFill = false;

// Custom cursor: a colored dot with white border for visibility on any background.
// The hotspot is the center; the color tracks `currentColor`.
function buildPenCursorUrl(color) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="white"/><circle cx="5" cy="5" r="2" fill="${color}"/></svg>`;
	return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}") 5 5, crosshair`;
}
let penCursorUrl = buildPenCursorUrl(currentColor);

const ERASER_CURSOR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
  <g transform="rotate(45 10 10)">
    <rect x="6" y="4" width="8" height="12" rx="1" fill="white" stroke="black" stroke-width="1.5"/>
    <line x1="6" y1="13" x2="14" y2="13" stroke="black" stroke-width="1"/>
  </g>
</svg>
`.trim();

const ERASER_CURSOR_URL = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(ERASER_CURSOR_SVG)}") 10 10, crosshair`;

const newBtn = document.getElementById('newBtn');
const delayBtn = document.getElementById('delayBtn');
const copyBtn = document.getElementById('copyBtn');
const penBtn = document.getElementById('penBtn');
const rectBtn = document.getElementById('rectBtn');
const styleBtn = document.getElementById('styleBtn');
const styleMenu = document.getElementById('styleMenu');
const styleSwatch = document.getElementById('styleSwatch');
const colorRow = document.getElementById('colorRow');
const widthRow = document.getElementById('widthRow');
const fillCheck = document.getElementById('fillCheck');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const eraserBtn = document.getElementById('eraserBtn');
const saveBtn = document.getElementById('saveBtn');
const saveOptionsBtn = document.getElementById('saveOptionsBtn');
const saveBtnWrapper = document.getElementById('saveBtnWrapper');
const saveMenu = document.getElementById('saveMenu');
const toolsSeparator = document.getElementById('toolsSeparator');
const mainSeparator = document.getElementById('mainSeparator');
const delayMenu = document.getElementById('delayMenu');
const countdownOverlay = document.getElementById('countdownOverlay');
const countdownNumber = document.getElementById('countdownNumber');
const statusNotification = document.getElementById('statusNotification');
const userTooltip = document.getElementById('userTooltip');
const tooltipText = document.getElementById('tooltipText');

// Video recording elements
const stopRecordBtn = document.getElementById('stopRecordBtn');
const recordingOverlay = document.getElementById('recordingOverlay');
const recordingTimer = document.getElementById('recordingTimer');
const timerText = document.getElementById('timerText');

// Video preview elements
const videoPreviewOverlay = document.getElementById('videoPreviewOverlay');
const previewVideo = document.getElementById('previewVideo');
const discardBtn = document.getElementById('discardBtn');

// Trim controls elements
const trimControls = document.getElementById('trimControls');
const trimBar = document.getElementById('trimBar');
const trimProgress = document.getElementById('trimProgress');
const trimHandleStart = document.getElementById('trimHandleStart');
const trimHandleEnd = document.getElementById('trimHandleEnd');
const trimPlayhead = document.getElementById('trimPlayhead');
const trimInTime = document.getElementById('trimInTime');
const trimOutTime = document.getElementById('trimOutTime');
const trimDuration = document.getElementById('trimDuration');
const setInBtn = document.getElementById('setInBtn');
const setOutBtn = document.getElementById('setOutBtn');
const resetTrimBtn = document.getElementById('resetTrimBtn');
const trimPlayBtn = document.getElementById('trimPlayBtn');
const trimStopBtn = document.getElementById('trimStopBtn');

// Trim button and mode elements
const trimBtn = document.getElementById('trimBtn');
const cancelTrimBtn = document.getElementById('cancelTrimBtn');
const applyTrimBtn = document.getElementById('applyTrimBtn');

// Trim state
let trimStart = 0;
let trimEnd = 0;
let videoDuration = 0;
let isDraggingTrimHandle = null; // 'start' | 'end' | null
let isInTrimMode = false;
let savedTrimStart = 0;
let savedTrimEnd = 0;

// Mode toggle elements
const modeToggle = document.getElementById('modeToggle');
const screenshotModeBtn = document.getElementById('screenshotModeBtn');
const recordModeBtn = document.getElementById('recordModeBtn');
const heroScreenshotModeBtn = document.getElementById('heroScreenshotModeBtn');
const heroRecordModeBtn = document.getElementById('heroRecordModeBtn');
const heroActionIcon = document.getElementById('heroActionIcon');

// Current mode: 'screenshot' or 'record'
let currentMode = 'screenshot';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const heroNewBtn = document.getElementById('heroNewBtn');
const heroDelayBtn = document.getElementById('heroDelayBtn');
const heroDelayMenu = document.getElementById('heroDelayMenu');
const heroBtnText = document.getElementById('heroBtnText');

const contentArea = document.querySelector('.content-area');

const canvasContainer = document.getElementById('canvasContainer');
const drawingCanvas = document.getElementById('drawingCanvas');
const drawingCtx = drawingCanvas.getContext('2d');

const selectionOverlay = document.getElementById('selectionOverlay');
const screenCanvas = document.getElementById('screenCanvas');
const screenCtx = screenCanvas.getContext('2d');
const selectionRectEl = document.getElementById('selectionRect');

let activeTool = 'none'; // 'none' | 'pen' | 'rect' | 'eraser'
let strokes = []; // Array of pen { type:'pen', points: [{x,y}], color, width } or rect { type:'rect', x, y, w, h, color, width }
let baseImageCanvas = null; // Stores the clean screenshot

let pendingAutoSaveType = null; // null | 'save' | 'save-as'
let captureDelay = 0; // Default no delay

// Video recording state
let isRecording = false;
let mediaRecorder = null;
let recordedChunks = [];
let recordedBlob = null; // Store the recorded video blob for preview
let recordingStartTime = null;
let recordingTimerInterval = null;
let screenStream = null;
let micStream = null;

// Track unsaved changes state
let hasUnsavedChanges = false;
let lastSavedHistoryIndex = -1; // Track which history index was last saved

function markAsUnsaved() {
	hasUnsavedChanges = true;
}

function markAsSaved() {
	hasUnsavedChanges = false;
	lastSavedHistoryIndex = historyIndex;
}

function checkHasUnsavedChanges() {
	// Has unsaved changes if:
	// 1. We have an image loaded (imageRect exists or overlayMap exists) or video recorded (recordedBlob)
	// 2. AND either hasUnsavedChanges flag is true OR we've never saved (lastSavedHistoryIndex === -1)
	// 3. OR the history has changed since last save
	
	// Check for unsaved video
	if (recordedBlob) return true;
	
	// Check for unsaved image
	if (!imageRect && !overlayMap) return false;
	if (hasUnsavedChanges) return true;
	if (lastSavedHistoryIndex === -1) return true; // Never saved
	if (historyIndex !== lastSavedHistoryIndex) return true; // History changed since save
	return false;
}

function confirmUnsavedChanges(action = 'leave') {
	const messages = {
		'leave': t('confirmLeave'),
		'new': t('confirmNew'),
		'exit': t('confirmExit')
	};
	return confirm(messages[action] || messages['leave']);
}

function setToolbarButtonsVisible(visible) {
	// Toggle mode toggle, New and Delay buttons in toolbar
	if (modeToggle) {
		modeToggle.style.display = visible ? '' : 'none';
	}
	newBtn.style.display = visible ? '' : 'none';
	// delayBtn is wrapped in delay-btn-wrapper
	const delayWrapper = delayBtn.closest('.delay-btn-wrapper');
	if (delayWrapper) {
		delayWrapper.style.display = visible ? '' : 'none';
	} else {
		delayBtn.style.display = visible ? '' : 'none';
	}
}

function updateDelayButtonText() {
	// Update toolbar button
	const textSpan = delayBtn.querySelector('.btn-text');
	if (captureDelay === 0) {
		textSpan.textContent = t('delay');
		delayBtn.classList.remove('delay-selected');
		// Update hero text - same 'New' for both modes
		heroBtnText.textContent = t('newSnip');
	} else {
		const seconds = captureDelay / 1000;
		textSpan.textContent = t('delayFormat', seconds);
		delayBtn.classList.add('delay-selected');
		// Update hero text - same format for both modes
		heroBtnText.textContent = t('newFormat', seconds);
	}
}

/** @type {{x:number,y:number,w:number,h:number}|null} */
let imageRect = null;

/** @type {{minX:number,minY:number,maxX:number,maxY:number}|null} */
let strokeBounds = null;

let isDrawing = false;
let lastPt = null;

// History for Undo/Redo
let historyStack = [];
let historyIndex = -1;

function updateEraserButtonState() {
	// Show eraser/rect/style whenever we're in drawing mode; hide elsewhere (e.g. selection/crop overlay).
	// Note: overlayMap is populated on the next animation frame, so use DOM visibility instead.
	const inCropMode = selectionOverlay.style.display !== 'none' && selectionOverlay.style.display !== '';
	const inDrawingMode = !!imageRect && !inCropMode;
	eraserBtn.disabled = !inDrawingMode;
	eraserBtn.classList.toggle('hidden', !inDrawingMode);
	rectBtn.disabled = !inDrawingMode;
	rectBtn.classList.toggle('hidden', !inDrawingMode);
	styleBtn.disabled = !inDrawingMode;
	styleBtn.classList.toggle('hidden', !inDrawingMode);
	if (!inDrawingMode) {
		styleMenu.classList.remove('show');
	}
}

/** Selection overlay mapping */
let overlayMap = null; // {frameW, frameH, drawX, drawY, drawW, drawH, dpr}
let selectionStart = null;
let rafPending = false;
let lastMoveEvent = null;

function setHasCapture(hasCapture) {
	copyBtn.disabled = !hasCapture;
	penBtn.disabled = !hasCapture;
	saveBtn.disabled = !hasCapture;
	saveOptionsBtn.disabled = !hasCapture;
	// Undo/Redo enabled state is managed by updateHistoryButtons(), 
	// but we toggle visibility here.

	if (hasCapture) {
		copyBtn.classList.remove('hidden');
		penBtn.classList.remove('hidden');
		toolsSeparator.classList.remove('hidden');
		saveBtnWrapper.classList.remove('hidden');
		mainSeparator.classList.remove('hidden');
	} else {
		copyBtn.classList.add('hidden');
		penBtn.classList.add('hidden');
		rectBtn.classList.add('hidden');
		styleBtn.classList.add('hidden');
		eraserBtn.classList.add('hidden');
		undoBtn.classList.add('hidden');
		redoBtn.classList.add('hidden');
		toolsSeparator.classList.add('hidden');
		saveBtnWrapper.classList.add('hidden');
		mainSeparator.classList.add('hidden');
	}
}

function showCopyFeedback() {
	copyBtn.classList.add('copied');
	copyBtn.innerHTML = `
		<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
	`;
	
	setTimeout(() => {
		copyBtn.classList.remove('copied');
		copyBtn.innerHTML = `
			<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2" />
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke-width="2" />
			</svg>
		`;
	}, 2000);
}

function resetState() {
	activeTool = 'none';
	penBtn.classList.remove('active');
	rectBtn.classList.remove('active');
	eraserBtn.classList.remove('active');
	canvasContainer.classList.remove('show');
	dropZone.classList.add('show');
	drawingCanvas.width = 0;
	drawingCanvas.height = 0;
	setToolbarButtonsVisible(false);
	imageRect = null;
	strokeBounds = null;
	isDrawing = false;
	lastPt = null;
	
	strokes = [];
	baseImageCanvas = null;
	historyStack = [];
	historyIndex = -1;
	updateHistoryButtons();

	// Reset unsaved changes tracking
	hasUnsavedChanges = false;
	lastSavedHistoryIndex = -1;

	setHasCapture(false);
	updateEraserButtonState();
	hideSelectionOverlay();
	
	// Clear video preview state if present
	if (videoPreviewOverlay.classList.contains('show')) {
		videoPreviewOverlay.classList.remove('show');
		videoPreviewOverlay.classList.remove('trim-mode');
		previewVideo.pause();
		if (previewVideo.src) {
			URL.revokeObjectURL(previewVideo.src);
			previewVideo.src = '';
		}
		recordedBlob = null;
		// Reset trim state
		trimStart = 0;
		trimEnd = 0;
		videoDuration = 0;
		isInTrimMode = false;
		trimControls.classList.remove('show');
		cancelTrimBtn.classList.add('hidden');
		applyTrimBtn.classList.add('hidden');
		trimBtn.classList.add('hidden');
	}
	
	// Hide discard button
	discardBtn.classList.add('hidden');
}

function updateHistoryButtons() {
	undoBtn.disabled = historyIndex <= 0;
	redoBtn.disabled = historyIndex >= historyStack.length - 1;
}

function saveHistory() {
	// If we are not at the end of the stack, discard the future
	if (historyIndex < historyStack.length - 1) {
		historyStack = historyStack.slice(0, historyIndex + 1);
	}

	// Save current state (deep copy of strokes)
	historyStack.push({
		strokes: JSON.parse(JSON.stringify(strokes)),
		imageRect: { ...imageRect },
		strokeBounds: strokeBounds ? { ...strokeBounds } : null
	});
	historyIndex++;
	updateHistoryButtons();
	
	// Mark as having unsaved changes when history changes
	markAsUnsaved();
}

function restoreHistoryState(state) {
	strokes = JSON.parse(JSON.stringify(state.strokes));
	imageRect = { ...state.imageRect };
	strokeBounds = state.strokeBounds ? { ...state.strokeBounds } : null;
	
	redrawCanvas();
	updateEraserButtonState();
}

function redrawCanvas() {
	drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	drawingCtx.fillStyle = '#ffffff';
	drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);

	if (baseImageCanvas && imageRect) {
		drawingCtx.drawImage(baseImageCanvas, imageRect.x, imageRect.y);
	}

	drawingCtx.lineCap = 'round';
	drawingCtx.lineJoin = 'round';

	const dpr = window.devicePixelRatio || 1;
	strokeBounds = null;

	for (const stroke of strokes) {
		if (stroke.type === 'rect') {
			drawingCtx.strokeStyle = stroke.color;
			drawingCtx.lineWidth = stroke.width * dpr;
			if (stroke.fill) {
				drawingCtx.fillStyle = stroke.fill;
				drawingCtx.fillRect(stroke.x, stroke.y, stroke.w, stroke.h);
			}
			drawingCtx.beginPath();
			drawingCtx.rect(stroke.x, stroke.y, stroke.w, stroke.h);
			drawingCtx.stroke();

			const half = stroke.width / 2;
			const x1 = Math.min(stroke.x, stroke.x + stroke.w);
			const y1 = Math.min(stroke.y, stroke.y + stroke.h);
			const x2 = Math.max(stroke.x, stroke.x + stroke.w);
			const y2 = Math.max(stroke.y, stroke.y + stroke.h);
			strokeBounds = unionBounds(strokeBounds, {
				minX: x1 - half,
				minY: y1 - half,
				maxX: x2 + half,
				maxY: y2 + half,
			});
			continue;
		}

		if (!stroke.points || stroke.points.length < 2) continue;
		drawingCtx.strokeStyle = stroke.color;
		drawingCtx.lineWidth = stroke.width * dpr;
		drawingCtx.beginPath();
		drawingCtx.moveTo(stroke.points[0].x, stroke.points[0].y);
		
		const half = stroke.width / 2;
		// Add first point to bounds
		strokeBounds = unionBounds(strokeBounds, {
			minX: stroke.points[0].x - half,
			minY: stroke.points[0].y - half,
			maxX: stroke.points[0].x + half,
			maxY: stroke.points[0].y + half,
		});

		for (let i = 1; i < stroke.points.length; i++) {
			const pt = stroke.points[i];
			drawingCtx.lineTo(pt.x, pt.y);
			
			strokeBounds = unionBounds(strokeBounds, {
				minX: pt.x - half,
				minY: pt.y - half,
				maxX: pt.x + half,
				maxY: pt.y + half,
			});
		}
		drawingCtx.stroke();
	}

	updateEraserButtonState();
}

function undo() {
	if (historyIndex > 0) {
		historyIndex--;
		restoreHistoryState(historyStack[historyIndex]);
		updateHistoryButtons();
		// Auto-copy after undo
		copyCurrentOutputToClipboard();
	}
}

function redo() {
	if (historyIndex < historyStack.length - 1) {
		historyIndex++;
		restoreHistoryState(historyStack[historyIndex]);
		updateHistoryButtons();
		// Auto-copy after redo
		copyCurrentOutputToClipboard();
	}
}

function setCanvasActualScale() {
	const dpr = window.devicePixelRatio || 1;
	const cssW = drawingCanvas.width / dpr;
	const cssH = drawingCanvas.height / dpr;
	const containerW = contentArea.clientWidth;
	const containerH = contentArea.clientHeight;

	const scale = Math.min(
		1,
		containerW / cssW,
		containerH / cssH
	);

	drawingCanvas.style.width = `${cssW * scale}px`;
	drawingCanvas.style.height = `${cssH * scale}px`;
}

function expandCanvasToAtLeast(minW, minH) {
	if (!minW || !minH) return;
	const targetW = Math.max(drawingCanvas.width, Math.floor(minW));
	const targetH = Math.max(drawingCanvas.height, Math.floor(minH));
	if (targetW === drawingCanvas.width && targetH === drawingCanvas.height) return;

	const snapshot = document.createElement('canvas');
	snapshot.width = drawingCanvas.width;
	snapshot.height = drawingCanvas.height;
	snapshot.getContext('2d').drawImage(drawingCanvas, 0, 0);

	drawingCanvas.width = targetW;
	drawingCanvas.height = targetH;
	setCanvasActualScale();

	drawingCtx.fillStyle = '#ffffff';
	drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	drawingCtx.drawImage(snapshot, 0, 0);
}

function ensureCanvasFillsMainArea() {
	if (!contentArea) return;
	const dpr = window.devicePixelRatio || 1;
	// contentArea is scrollable; ensure the canvas is at least as big as the visible viewport.
	const minW = contentArea.clientWidth * dpr;
	const minH = contentArea.clientHeight * dpr;
	expandCanvasToAtLeast(minW, minH);
	setCanvasActualScale();
}

function getCanvasPointFromPointerEvent(canvas, ev) {
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	return {
		x: (ev.clientX - rect.left) * scaleX,
		y: (ev.clientY - rect.top) * scaleY,
	};
}

function normalizeBounds(b) {
	return {
		minX: Math.min(b.minX, b.maxX),
		minY: Math.min(b.minY, b.maxY),
		maxX: Math.max(b.minX, b.maxX),
		maxY: Math.max(b.minY, b.maxY),
	};
}

function unionBounds(a, b) {
	if (!a) return { ...b };
	return {
		minX: Math.min(a.minX, b.minX),
		minY: Math.min(a.minY, b.minY),
		maxX: Math.max(a.maxX, b.maxX),
		maxY: Math.max(a.maxY, b.maxY),
	};
}

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function boundsWithinRect(b, r) {
	return b.minX >= r.x && b.minY >= r.y && b.maxX <= r.x + r.w && b.maxY <= r.y + r.h;
}

function computeOutputCropRect() {
	if (!imageRect) return null;

	const base = {
		x: imageRect.x,
		y: imageRect.y,
		w: imageRect.w,
		h: imageRect.h,
	};

	if (!strokeBounds) return base;

	const sb = normalizeBounds(strokeBounds);
	if (boundsWithinRect(sb, imageRect)) {
		return base;
	}

	const x1 = Math.min(imageRect.x, sb.minX);
	const y1 = Math.min(imageRect.y, sb.minY);
	const x2 = Math.max(imageRect.x + imageRect.w, sb.maxX);
	const y2 = Math.max(imageRect.y + imageRect.h, sb.maxY);

	const clampedX1 = Math.max(0, Math.floor(x1));
	const clampedY1 = Math.max(0, Math.floor(y1));
	const clampedX2 = Math.min(drawingCanvas.width, Math.ceil(x2));
	const clampedY2 = Math.min(drawingCanvas.height, Math.ceil(y2));

	return {
		x: clampedX1,
		y: clampedY1,
		w: Math.max(1, clampedX2 - clampedX1),
		h: Math.max(1, clampedY2 - clampedY1),
	};
}

async function renderOutputBlob() {
	const crop = computeOutputCropRect();
	if (!crop) return null;

	const outCanvas = document.createElement('canvas');
	outCanvas.width = crop.w;
	outCanvas.height = crop.h;
	const outCtx = outCanvas.getContext('2d');
	outCtx.drawImage(
		drawingCanvas,
		crop.x,
		crop.y,
		crop.w,
		crop.h,
		0,
		0,
		crop.w,
		crop.h
	);

	return await new Promise((resolve) => {
		outCanvas.toBlob((blob) => resolve(blob), 'image/png');
	});
}

async function copyCurrentOutputToClipboard(opts = {}) {
	// Back-compat: a bare boolean is treated as { feedback }.
	if (typeof opts === 'boolean') opts = { feedback: opts };
	const { feedback = false, fallbackDownload = false } = opts;

	// Helper to get the blob
	async function getBlobForCopy() {
		let blob = await renderOutputBlob();
		// If no cropped output, check if we have a full frame capture
		if (!blob && overlayMap && overlayMap.frameCanvas) {
			blob = await new Promise((resolve) => {
				overlayMap.frameCanvas.toBlob((b) => resolve(b), 'image/png');
			});
		}
		return blob;
	}

	// Try standard Clipboard API first
	// Pass Promise directly to ClipboardItem (Safari requires this to stay within user activation)
	if (navigator.clipboard && window.ClipboardItem) {
		try {
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': getBlobForCopy() })
			]);
			
			if (feedback) {
				showCopyFeedback();
			}
			return;
		} catch (clipboardErr) {
			// Clipboard API failed, try fallback
			console.warn('Clipboard API failed, trying fallback:', clipboardErr);
		}
	}

	const blob = await getBlobForCopy();
	if (!blob) return;

	// Fallback: Use Web Share API (works on iOS Safari) — only if explicit user action.
	if (fallbackDownload && navigator.canShare && navigator.share) {
		try {
			const file = new File([blob], 'screenshot.png', { type: 'image/png' });
			if (navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: 'Screenshot'
				});
				if (feedback) {
					showCopyFeedback();
				}
				return;
			}
		} catch (shareErr) {
			console.warn('Share API failed:', shareErr);
		}
	}

	// Final fallback: download the image — ONLY when the caller explicitly opted in
	// (the Copy button). All implicit auto-copies (post-capture, post-crop, post-stroke)
	// must never silently save a file; saving is reserved for the Save button.
	if (!fallbackDownload) return;

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `snip-${Date.now()}.png`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
	if (feedback) {
		showCopyFeedback();
	}
}

function saveBlobToFile(blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `snip-${Date.now()}.png`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

async function saveAsBlobToFile(blob) {
	if (window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: `snip-${Date.now()}.png`,
				types: [{
					description: 'PNG Image',
					accept: { 'image/png': ['.png'] },
				}],
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return;
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.error('Save As failed:', err);
			}
			// If aborted or failed, do nothing (or fallback? usually abort means user cancelled)
			return;
		}
	}
	// Fallback to regular save if API not supported
	saveBlobToFile(blob);
}

async function saveCurrentOutputToFile(saveAs = false) {
	const blob = await renderOutputBlob();
	if (!blob) return;
	if (saveAs) {
		await saveAsBlobToFile(blob);
	} else {
		saveBlobToFile(blob);
	}
	// Mark as saved after successful file save
	markAsSaved();
}

function setupDrawingCanvasFromCroppedImage(croppedCanvas) {
	const dpr = window.devicePixelRatio || 1;
	const w = croppedCanvas.width;
	const h = croppedCanvas.height;
	const pad = CANVAS_PADDING_PX * dpr;

	// Store base image
	baseImageCanvas = document.createElement('canvas');
	baseImageCanvas.width = w;
	baseImageCanvas.height = h;
	baseImageCanvas.getContext('2d').drawImage(croppedCanvas, 0, 0);

	// Make the canvas at least as large as the visible main area so all whitespace is drawable.
	// Also ensure there is at least some padding around the image.
	const baseW = w + pad * 2;
	const baseH = h + pad * 2;
	const minW = contentArea ? (contentArea.clientWidth * dpr) : 0;
	const minH = contentArea ? (contentArea.clientHeight * dpr) : 0;
	drawingCanvas.width = Math.max(baseW, minW);
	drawingCanvas.height = Math.max(baseH, minH);
	setCanvasActualScale();

	// If there's extra room, center the image within the canvas.
	const imgX = Math.max(pad, Math.floor((drawingCanvas.width - w) / 2));
	const imgY = Math.max(pad, Math.floor((drawingCanvas.height - h) / 2));
	
	imageRect = { x: imgX, y: imgY, w, h };
	strokeBounds = null;
	strokes = [];

	redrawCanvas();

	// Initialize history with the clean image
	historyStack = [];
	historyIndex = -1;
	saveHistory();

	canvasContainer.classList.add('show');
	dropZone.classList.remove('show');
	setToolbarButtonsVisible(true);
	setHasCapture(true);
	setActiveTool('pen');
	updateEraserButtonState();
	
	// Show discard button for drawing mode
	discardBtn.classList.remove('hidden');

	// If layout changes after first paint, make sure canvas still fills the main area.
	queueMicrotask(() => ensureCanvasFillsMainArea());
}

async function startNewSnip() {
	let stream;
	try {
		const options = { video: true, audio: false };
		if (window.CaptureController) {
			const controller = new CaptureController();
			if (controller.setFocusBehavior) {
				controller.setFocusBehavior('no-focus-change');
				options.controller = controller;
			}
		}
		stream = await navigator.mediaDevices.getDisplayMedia(options);
		// Attempt to bring focus back to this tab, in case the browser switched away
		// and CaptureController was not supported or effective.
		window.focus();
	} catch (err) {
		console.warn('Screen capture was canceled or not allowed:', err);
		pendingAutoSaveType = null;
		return;
	}

	const [track] = stream.getVideoTracks();
	
	let autoAppliedDelay = false;
	try {
		const settings = track.getSettings();
		// displaySurface can be "monitor", "window", or "browser"
		if (settings.displaySurface === 'monitor' && captureDelay === 0) {
			captureDelay = 5000;
			updateDelayButtonText();
			autoAppliedDelay = true;
			
			// Update active state in delay menu
			delayMenu.querySelectorAll('.dropdown-item').forEach(el => {
				el.classList.toggle('active', parseInt(el.dataset.delay, 10) === 5000);
			});

			statusNotification.classList.add('show');
			console.log('Entire screen selected - automatically applying 5-second delay');
		}
	} catch (err) {
		console.warn('Unable to detect display surface type:', err);
	}
	let frameCanvas = null;

	try {
		// Give the user time to switch windows/screens before capturing
		// The delay allows you to set up your screen layout
		const delay = captureDelay === 0 ? POST_PICKER_CAPTURE_DELAY_MS : captureDelay;
		
		if (captureDelay > 0) {
			// Show countdown overlay and update delay button
			delayBtn.classList.add('delaying');
			const originalTitle = document.title;
			countdownOverlay.classList.add('show');
			
			// Countdown in seconds
			const totalSeconds = Math.ceil(delay / 1000);
			for (let i = totalSeconds; i > 0; i--) {
				countdownNumber.textContent = i;
				document.title = `(${i}) ${originalTitle}`;
				// Trigger animation restart
				countdownNumber.style.animation = 'none';
				setTimeout(() => {
					countdownNumber.style.animation = '';
				}, 10);
				await wait(1000);
			}
			
			countdownOverlay.classList.remove('show');
			delayBtn.classList.remove('delaying');
			document.title = originalTitle;
			
			// Hide status notification after countdown
			if (autoAppliedDelay) {
				statusNotification.classList.remove('show');
			}
		} else {
			await wait(delay);
		}
		

		// 1. Try ImageCapture API (Chromium) for fastest possible capture
		if (window.ImageCapture) {
			console.log('Using ImageCapture API to grab frame.');
			try {
				const capturer = new ImageCapture(track);
				const bitmap = await Promise.race([
					capturer.grabFrame(),
					new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 500))
				]);
				frameCanvas = document.createElement('canvas');
				frameCanvas.width = bitmap.width;
				frameCanvas.height = bitmap.height;
				frameCanvas.getContext('2d').drawImage(bitmap, 0, 0);
				bitmap.close();
			} catch (err) {
				// Ignore and fall back to video element
			}
		}

		// 2. Fallback: Video element (Firefox, Safari, or if ImageCapture failed)
		if (!frameCanvas) {
			console.log('Using video element to grab frame.');
			const video = document.createElement('video');
			video.srcObject = stream;
			video.playsInline = true;
			video.muted = true;

			await video.play();

			if (video.readyState < 2) {
				await new Promise((resolve) => {
					const onData = () => {
						video.removeEventListener('loadeddata', onData);
						resolve();
					};
					video.addEventListener('loadeddata', onData);
					setTimeout(resolve, 1000);
				});
			}

			const frameW = video.videoWidth;
			const frameH = video.videoHeight;
			if (frameW && frameH) {
				frameCanvas = document.createElement('canvas');
				frameCanvas.width = frameW;
				frameCanvas.height = frameH;
				frameCanvas.getContext('2d').drawImage(video, 0, 0, frameW, frameH);
			}
			video.srcObject = null;
		}
	} catch (err) {
		console.error('Error capturing frame:', err);
	} finally {
		// Stop capturing immediately after we grab a frame (or if failed).
		track.stop();
		stream.getTracks().forEach((t) => t.stop());
	}

	if (frameCanvas) {
		resetState();
		showSelectionOverlay(frameCanvas);
	}
}

function renderSelectionOverlay(frameCanvas) {
	const dpr = window.devicePixelRatio || 1;
	const cssW = contentArea.clientWidth;
	const cssH = contentArea.clientHeight;
	screenCanvas.width = Math.floor(cssW * dpr);
	screenCanvas.height = Math.floor(cssH * dpr);
	screenCanvas.style.width = `${cssW}px`;
	screenCanvas.style.height = `${cssH}px`;

	screenCtx.setTransform(1, 0, 0, 1, 0, 0);
	screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
	screenCtx.imageSmoothingEnabled = true;

	// Draw the captured frame into the overlay using "contain" scaling.
	const frameW = frameCanvas.width;
	const frameH = frameCanvas.height;
	const scale = Math.min(screenCanvas.width / frameW, screenCanvas.height / frameH);
	const drawW = Math.floor(frameW * scale);
	const drawH = Math.floor(frameH * scale);
	const drawX = Math.floor((screenCanvas.width - drawW) / 2);
	const drawY = Math.floor((screenCanvas.height - drawH) / 2);

	screenCtx.fillStyle = '#ffffff';
	screenCtx.fillRect(0, 0, screenCanvas.width, screenCanvas.height);
	screenCtx.drawImage(frameCanvas, 0, 0, frameW, frameH, drawX, drawY, drawW, drawH);

	overlayMap = { frameW, frameH, drawX, drawY, drawW, drawH, dpr, frameCanvas };
}

function showSelectionOverlay(frameCanvas, autoCopy = true) {
	selectionOverlay.style.display = 'block';
	selectionRectEl.style.display = 'none';
	dropZone.classList.remove('show');
	setToolbarButtonsVisible(true);

	// Show tools immediately after capture
	setHasCapture(true);
	penBtn.disabled = false;
	// Copy is allowed in crop mode (copies full frame)
	copyBtn.disabled = false;
	// Hide eraser/rect/style in crop mode (vs pen mode)
	eraserBtn.classList.add('hidden');
	rectBtn.classList.add('hidden');
	styleBtn.classList.add('hidden');
	styleMenu.classList.remove('show');
	updateEraserButtonState();
	
	// Show discard button for image capture mode
	discardBtn.classList.remove('hidden');
	
	// Mark as having unsaved changes (we have a captured frame)
	markAsUnsaved();
	
	// Show tooltip for crop mode
	tooltipText.textContent = t('cropModeHint');
	userTooltip.classList.add('show');

	// Wait for next frame to ensure accurate dimensions after banner changes
	requestAnimationFrame(async () => {
		renderSelectionOverlay(frameCanvas);
		selectionStart = null;

		// Auto-copy the full captured frame (if requested)
		if (autoCopy) {
			await copyCurrentOutputToClipboard(true);
		}
	});
}

function hideSelectionOverlay() {
	selectionOverlay.style.display = 'none';
	selectionRectEl.style.display = 'none';
	overlayMap = null;
	selectionStart = null;
	// Hide tooltip when exiting crop mode
	userTooltip.classList.remove('show');
}

function updateSelectionRect(start, current) {
	const x1 = Math.min(start.x, current.x);
	const y1 = Math.min(start.y, current.y);
	const x2 = Math.max(start.x, current.x);
	const y2 = Math.max(start.y, current.y);
	selectionRectEl.style.display = 'block';
	selectionRectEl.style.left = `${x1}px`;
	selectionRectEl.style.top = `${y1}px`;
	selectionRectEl.style.width = `${x2 - x1}px`;
	selectionRectEl.style.height = `${y2 - y1}px`;
}

function selectionToFrameCropRect(startCss, endCss) {
	if (!overlayMap) return null;
	const { frameW, frameH, drawX, drawY, drawW, drawH, dpr } = overlayMap;

	const x1Css = Math.min(startCss.x, endCss.x);
	const y1Css = Math.min(startCss.y, endCss.y);
	const x2Css = Math.max(startCss.x, endCss.x);
	const y2Css = Math.max(startCss.y, endCss.y);

	const x1 = x1Css * dpr;
	const y1 = y1Css * dpr;
	const x2 = x2Css * dpr;
	const y2 = y2Css * dpr;

	// Clamp selection to the drawn frame area (letterboxed).
	const cx1 = Math.max(drawX, Math.min(drawX + drawW, x1));
	const cy1 = Math.max(drawY, Math.min(drawY + drawH, y1));
	const cx2 = Math.max(drawX, Math.min(drawX + drawW, x2));
	const cy2 = Math.max(drawY, Math.min(drawY + drawH, y2));

	const selW = cx2 - cx1;
	const selH = cy2 - cy1;
	if (selW < 1 || selH < 1) return null;

	const fx1 = ((cx1 - drawX) / drawW) * frameW;
	const fy1 = ((cy1 - drawY) / drawH) * frameH;
	const fx2 = ((cx2 - drawX) / drawW) * frameW;
	const fy2 = ((cy2 - drawY) / drawH) * frameH;

	const ix1 = Math.max(0, Math.floor(Math.min(fx1, fx2)));
	const iy1 = Math.max(0, Math.floor(Math.min(fy1, fy2)));
	const ix2 = Math.min(frameW, Math.ceil(Math.max(fx1, fx2)));
	const iy2 = Math.min(frameH, Math.ceil(Math.max(fy1, fy2)));

	const w = Math.max(1, ix2 - ix1);
	const h = Math.max(1, iy2 - iy1);
	return { x: ix1, y: iy1, w, h };
}

function cropFrameToCanvas(frameCanvas, crop) {
	const out = document.createElement('canvas');
	out.width = crop.w;
	out.height = crop.h;
	const ctx = out.getContext('2d');
	ctx.drawImage(frameCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
	return out;
}

function onOverlayPointerDown(ev) {
	// Only handle primary (left) mouse button; allow right-click for context menu
	if (ev.button !== 0) return;
	if (!overlayMap) return;
	try {
		selectionOverlay.setPointerCapture(ev.pointerId);
	} catch (e) {
		// ignore
	}
	selectionStart = { x: ev.clientX, y: ev.clientY };
	updateSelectionRect(selectionStart, selectionStart);
}

function onOverlayPointerMove(ev) {
	if (!selectionStart) return;
	lastMoveEvent = { x: ev.clientX, y: ev.clientY };

	if (!rafPending) {
		rafPending = true;
		requestAnimationFrame(() => {
			rafPending = false;
			if (lastMoveEvent && selectionStart) {
				updateSelectionRect(selectionStart, lastMoveEvent);
			}
		});
	}
}

async function onOverlayPointerUp(ev) {
	if (!overlayMap || !selectionStart) return;

	try {
		selectionOverlay.releasePointerCapture(ev.pointerId);
	} catch (e) {
		// ignore
	}

	const start = selectionStart;
	const end = { x: ev.clientX, y: ev.clientY };
	selectionStart = null;
	selectionRectEl.style.display = 'none';

	// Calculate distance to determine if it was a click or drag
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	// If the unhold position is the initial start click position (or very close),
	// stay in crop mode standby.
	if (dist < 5) {
		return;
	}

	const crop = selectionToFrameCropRect(start, end);
	if (!crop) return;

	const frameCanvas = overlayMap.frameCanvas;
	hideSelectionOverlay();
	const cropped = cropFrameToCanvas(frameCanvas, crop);
	setupDrawingCanvasFromCroppedImage(cropped);

	// After capture, automatically copy once with visual feedback.
	await copyCurrentOutputToClipboard(true);

	// If Save was pressed before capture, auto-save right after selection.
	if (pendingAutoSaveType) {
		const type = pendingAutoSaveType;
		pendingAutoSaveType = null;
		await saveCurrentOutputToFile(type === 'save-as');
	}
}

function setActiveTool(tool) {
	activeTool = tool;
	penBtn.classList.toggle('active', activeTool === 'pen');
	rectBtn.classList.toggle('active', activeTool === 'rect');
	eraserBtn.classList.toggle('active', activeTool === 'eraser');
	
	if (activeTool === 'pen') {
		drawingCanvas.style.cursor = penCursorUrl;
		// Show tooltip when entering pen mode
		tooltipText.textContent = t('penModeHint');
		userTooltip.classList.add('show');
	} else if (activeTool === 'rect') {
		drawingCanvas.style.cursor = 'crosshair';
		tooltipText.textContent = t('rectModeHint');
		userTooltip.classList.add('show');
	} else if (activeTool === 'eraser') {
		drawingCanvas.style.cursor = ERASER_CURSOR_URL;
		// Hide tooltip when switching to eraser
		userTooltip.classList.remove('show');
	} else {
		drawingCanvas.style.cursor = 'default';
		// Hide tooltip when exiting to no tool
		userTooltip.classList.remove('show');
	}
	
	if (activeTool !== 'none') {
		undoBtn.classList.remove('hidden');
		redoBtn.classList.remove('hidden');
	} else {
		undoBtn.classList.add('hidden');
		redoBtn.classList.add('hidden');
	}
	
	updateHistoryButtons();
}

function distanceToSegment(p, v, w) {
	const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
	if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
	let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
	t = Math.max(0, Math.min(1, t));
	return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function eraseStrokeAt(pt) {
	const threshold = 10; // Tolerance in pixels
	let changed = false;
	
	for (let i = strokes.length - 1; i >= 0; i--) {
		const stroke = strokes[i];
		let hit = false;

		if (stroke.type === 'rect') {
			const x1 = Math.min(stroke.x, stroke.x + stroke.w);
			const y1 = Math.min(stroke.y, stroke.y + stroke.h);
			const x2 = Math.max(stroke.x, stroke.x + stroke.w);
			const y2 = Math.max(stroke.y, stroke.y + stroke.h);
			// Filled rectangles: any point inside the rect counts as a hit (typical UX).
			if (stroke.fill && pt.x >= x1 && pt.x <= x2 && pt.y >= y1 && pt.y <= y2) {
				hit = true;
			} else {
				const corners = [
					{x: x1, y: y1}, {x: x2, y: y1},
					{x: x2, y: y2}, {x: x1, y: y2},
				];
				for (let k = 0; k < 4; k++) {
					if (distanceToSegment(pt, corners[k], corners[(k + 1) % 4]) < threshold) {
						hit = true;
						break;
					}
				}
			}
		} else if (stroke.points) {
			for (let j = 0; j < stroke.points.length - 1; j++) {
				const dist = distanceToSegment(pt, stroke.points[j], stroke.points[j+1]);
				if (dist < threshold) {
					hit = true;
					break;
				}
			}
		}
		
		if (hit) {
			strokes.splice(i, 1);
			changed = true;
		}
	}
	return changed;
}

function onCanvasPointerDown(ev) {
	// Only handle primary (left) mouse button; allow right-click for context menu
	if (ev.button !== 0) return;
	if (activeTool === 'none' || !imageRect) return;
	isDrawing = true;
	drawingCanvas.setPointerCapture(ev.pointerId);
	lastPt = getCanvasPointFromPointerEvent(drawingCanvas, ev);

	if (activeTool === 'pen') {
		drawingCtx.lineCap = 'round';
		drawingCtx.lineJoin = 'round';
		drawingCtx.strokeStyle = currentColor;
		drawingCtx.lineWidth = currentWidth * (window.devicePixelRatio || 1);

		drawingCtx.beginPath();
		drawingCtx.moveTo(lastPt.x, lastPt.y);

		strokes.push({
			type: 'pen',
			points: [{x: lastPt.x, y: lastPt.y}],
			color: currentColor,
			width: currentWidth
		});

		const half = currentWidth / 2;
		strokeBounds = unionBounds(strokeBounds, {
			minX: lastPt.x - half,
			minY: lastPt.y - half,
			maxX: lastPt.x + half,
			maxY: lastPt.y + half,
		});
	} else if (activeTool === 'rect') {
		strokes.push({
			type: 'rect',
			x: lastPt.x,
			y: lastPt.y,
			w: 0,
			h: 0,
			color: currentColor,
			width: currentWidth,
			fill: rectFill ? currentColor : null,
		});
	} else if (activeTool === 'eraser') {
		if (eraseStrokeAt(lastPt)) {
			redrawCanvas();
			updateEraserButtonState();
		}
	}
}

function onCanvasPointerMove(ev) {
	if (!isDrawing || !lastPt) return;
	const pt = getCanvasPointFromPointerEvent(drawingCanvas, ev);
	
	if (activeTool === 'pen') {
		drawingCtx.lineTo(pt.x, pt.y);
		drawingCtx.stroke();
		
		const current = strokes[strokes.length - 1];
		current.points.push({x: pt.x, y: pt.y});

		const half = current.width / 2;
		strokeBounds = unionBounds(strokeBounds, {
			minX: pt.x - half,
			minY: pt.y - half,
			maxX: pt.x + half,
			maxY: pt.y + half,
		});
	} else if (activeTool === 'rect') {
		const current = strokes[strokes.length - 1];
		current.w = pt.x - current.x;
		current.h = pt.y - current.y;
		redrawCanvas();
	} else if (activeTool === 'eraser') {
		if (eraseStrokeAt(pt)) {
			redrawCanvas();
			updateEraserButtonState();
		}
	}
	lastPt = pt;
}

async function onCanvasPointerUp(ev) {
	if (!isDrawing) return;
	isDrawing = false;
	lastPt = null;
	try {
		drawingCanvas.releasePointerCapture(ev.pointerId);
	} catch {
		// ignore
	}

	// Drop empty/zero-area rectangles created by a click without drag.
	if (activeTool === 'rect' && strokes.length > 0) {
		const last = strokes[strokes.length - 1];
		if (last.type === 'rect' && Math.abs(last.w) < 2 && Math.abs(last.h) < 2) {
			strokes.pop();
			redrawCanvas();
			updateEraserButtonState();
			return;
		}
	}

	saveHistory();
	updateEraserButtonState();

	// After each stroke, automatically copy again.
	await copyCurrentOutputToClipboard();
}

// Wire up UI
newBtn.addEventListener('click', () => {
	if (currentMode === 'record') {
		startRecording();
	} else {
		startNewSnip();
	}
});

delayBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	delayMenu.classList.toggle('show');
});

// Handle delay menu item clicks
delayMenu.addEventListener('click', (e) => {
	e.stopPropagation();
	const item = e.target.closest('.dropdown-item');
	if (!item) return;
	
	// Update active state
	delayMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
	item.classList.add('active');
	
	// Update delay value
	captureDelay = parseInt(item.dataset.delay, 10);

	// Sync hero menu active state too (simplification)
	if (heroDelayMenu) {
		heroDelayMenu.querySelectorAll('.dropdown-item').forEach(el => {
			el.classList.toggle('active', parseInt(el.dataset.delay, 10) === captureDelay);
		});
	}
	
	// Update button text
	updateDelayButtonText();
	
	// Hide menu
	delayMenu.classList.remove('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
	delayMenu.classList.remove('show');
	if (heroDelayMenu) heroDelayMenu.classList.remove('show');
	saveMenu.classList.remove('show');
	styleMenu.classList.remove('show');
	// Note: lang dropdown closes itself via setupLanguagePicker's own outside-click handler.
});

saveOptionsBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	saveMenu.classList.toggle('show');
});

saveMenu.addEventListener('click', async (e) => {
	e.stopPropagation();
	const saveAsItem = e.target.closest('#saveAsItem');
	if (saveAsItem) {
		saveMenu.classList.remove('show');
		await performSave(true);
	}
});

copyBtn.addEventListener('click', () => copyCurrentOutputToClipboard({ feedback: true, fallbackDownload: true }));

undoBtn.addEventListener('click', undo);
redoBtn.addEventListener('click', redo);

async function performSave(forceSaveAs = false) {
	const isSaveAs = forceSaveAs;

	// Handle video save when we have a recorded video blob
	if (recordedBlob) {
		const blobToSave = await getVideoForSave();
		if (isSaveAs) {
			await saveAsVideoToFile(blobToSave);
		} else {
			saveVideoToFile(blobToSave);
		}
		// Stay on video preview page after save - only discard button goes back
		return;
	}

	if (imageRect) {
		await saveCurrentOutputToFile(isSaveAs);
		return;
	}

	if (overlayMap && overlayMap.frameCanvas) {
		overlayMap.frameCanvas.toBlob(async (blob) => {
			if (blob) {
				if (isSaveAs) {
					await saveAsBlobToFile(blob);
				} else {
					saveBlobToFile(blob);
				}
				// Mark as saved after successful file save from overlay
				markAsSaved();
			}
		}, 'image/png');
		return;
	}

	// "Save before snip": start a new snip and auto-save after selection.
	pendingAutoSaveType = isSaveAs ? 'save-as' : 'save';
	await startNewSnip();
}

saveBtn.addEventListener('click', () => performSave(false));

penBtn.addEventListener('click', () => {
	// If we're showing the selection overlay while a drawing canvas already exists,
	// that means we're in "crop mode" (entered by clicking Pen while annotating).
	// Clicking Pen again should exit crop mode and return to pen annotation.
	if (overlayMap && imageRect) {
		hideSelectionOverlay();
		updateEraserButtonState();
		setActiveTool('pen');
		return;
	}

	if (overlayMap && !imageRect) {
		const frameCanvas = overlayMap.frameCanvas;
		hideSelectionOverlay();
		setupDrawingCanvasFromCroppedImage(frameCanvas);
		return;
	}
	if (!imageRect) return;
	
	if (activeTool === 'pen') {
		// Capture the current drawing canvas state
		const currentCanvas = document.createElement('canvas');
		currentCanvas.width = drawingCanvas.width;
		currentCanvas.height = drawingCanvas.height;
		currentCanvas.getContext('2d').drawImage(drawingCanvas, 0, 0);
		
		setActiveTool('none');
		showSelectionOverlay(currentCanvas, false);
	} else {
		setActiveTool('pen');
	}
});

rectBtn.addEventListener('click', () => {
	// Rectangle tool only works in drawing mode (not in crop mode)
	if (!imageRect) return;
	if (selectionOverlay.style.display !== 'none' && selectionOverlay.style.display !== '') return;

	if (activeTool === 'rect') {
		return;
	}
	setActiveTool('rect');
});

eraserBtn.addEventListener('click', () => {
	// Eraser only works in drawing mode, not in crop mode
	if (!imageRect) return;
	if (selectionOverlay.style.display !== 'none' && selectionOverlay.style.display !== '') return;
	
	if (activeTool === 'eraser') {
		return;
	}
	setActiveTool('eraser');
});

// ============ Style picker (color / width / fill) ============
function updateStyleSwatch() {
	if (!styleSwatch) return;
	styleSwatch.style.background = currentColor;
}

function setColor(color) {
	currentColor = color;
	updateStyleSwatch();
	// Refresh pen cursor so it reflects the new color when pen is active.
	penCursorUrl = buildPenCursorUrl(currentColor);
	if (activeTool === 'pen') {
		drawingCanvas.style.cursor = penCursorUrl;
	}
	colorRow.querySelectorAll('.color-swatch').forEach(b => {
		b.classList.toggle('active', b.dataset.color === color);
	});
}

function setStrokeWidth(width) {
	currentWidth = width;
	widthRow.querySelectorAll('.width-opt').forEach(b => {
		b.classList.toggle('active', parseInt(b.dataset.width, 10) === width);
	});
}

function setRectFill(enabled) {
	rectFill = !!enabled;
	if (fillCheck) fillCheck.checked = rectFill;
}

styleBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	if (styleBtn.disabled) return;
	// Close other dropdowns first.
	delayMenu.classList.remove('show');
	if (heroDelayMenu) heroDelayMenu.classList.remove('show');
	saveMenu.classList.remove('show');
	styleMenu.classList.toggle('show');
});

// Keep the menu open while interacting with its inner controls.
styleMenu.addEventListener('click', (e) => e.stopPropagation());

colorRow.addEventListener('click', (e) => {
	const swatch = e.target.closest('.color-swatch');
	if (!swatch) return;
	setColor(swatch.dataset.color);
});

widthRow.addEventListener('click', (e) => {
	const opt = e.target.closest('.width-opt');
	if (!opt) return;
	setStrokeWidth(parseInt(opt.dataset.width, 10));
});

if (fillCheck) {
	fillCheck.addEventListener('change', () => setRectFill(fillCheck.checked));
}

// Initialize style UI from defaults.
setColor(currentColor);
setStrokeWidth(currentWidth);
setRectFill(rectFill);

selectionOverlay.addEventListener('pointerdown', onOverlayPointerDown);
selectionOverlay.addEventListener('pointermove', onOverlayPointerMove);
selectionOverlay.addEventListener('pointerup', onOverlayPointerUp);

drawingCanvas.addEventListener('pointerdown', onCanvasPointerDown);
drawingCanvas.addEventListener('pointermove', onCanvasPointerMove);
drawingCanvas.addEventListener('pointerup', onCanvasPointerUp);
drawingCanvas.addEventListener('pointercancel', onCanvasPointerUp);

function handleImageBlob(blob) {
	// Load the image
	const img = new Image();
	const url = URL.createObjectURL(blob);
	
	img.onload = () => {
		URL.revokeObjectURL(url);
		
		// Create canvas from the image
		const pastedCanvas = document.createElement('canvas');
		pastedCanvas.width = img.naturalWidth;
		pastedCanvas.height = img.naturalHeight;
		const ctx = pastedCanvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		
		// If we're already in drawing mode, reset first
		if (imageRect || canvasContainer.classList.contains('show')) {
			resetState();
		}
		
		// If in crop mode, hide it
		if (overlayMap && selectionOverlay.style.display === 'block') {
			hideSelectionOverlay();
		}
		
		// Setup drawing canvas with the image and auto-enter pen mode
		setupDrawingCanvasFromCroppedImage(pastedCanvas);
	};
	
	img.onerror = () => {
		URL.revokeObjectURL(url);
		console.error('Failed to load image');
	};
	
	img.src = url;
}

// Paste handler to support pasting images from clipboard
document.addEventListener('paste', async (ev) => {
	const items = ev.clipboardData?.items;
	if (!items) return;
	
	for (const item of items) {
		if (item.type.startsWith('image/')) {
			ev.preventDefault();
			const blob = item.getAsFile();
			if (!blob) continue;
			
			handleImageBlob(blob);
			break; // Only handle the first image
		}
	}
});

// Drag and drop handlers
dropZone.addEventListener('click', (e) => {
	// If clicking the hero button or mode toggle, don't trigger file input
	if (e.target.closest('.hero-split-btn') || e.target.closest('#heroDelayMenu') || e.target.closest('.hero-mode-toggle')) return;
	fileInput.click();
});

heroNewBtn.addEventListener('click', (e) => {
	e.stopPropagation(); // Prevent dropZone click
	if (currentMode === 'record') {
		startRecording();
	} else {
		startNewSnip();
	}
});

if (heroDelayBtn) {
	heroDelayBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		heroDelayMenu.classList.toggle('show');
	});
}

if (heroDelayMenu) {
	heroDelayMenu.addEventListener('click', (e) => {
		e.stopPropagation();
		const item = e.target.closest('.dropdown-item');
		if (!item) return;

		// Update delay value
		captureDelay = parseInt(item.dataset.delay, 10);

		// Update active state in both menus
		[delayMenu, heroDelayMenu].forEach(menu => {
			menu.querySelectorAll('.dropdown-item').forEach(el => {
				el.classList.toggle('active', parseInt(el.dataset.delay, 10) === captureDelay);
			});
		});
		
		updateDelayButtonText();
		heroDelayMenu.classList.remove('show');
	});
}

fileInput.addEventListener('change', (ev) => {
	if (ev.target.files && ev.target.files.length > 0) {
		handleImageBlob(ev.target.files[0]);
		fileInput.value = '';
	}
});

document.addEventListener('dragover', (ev) => {
	ev.preventDefault();
	dropZone.classList.add('drag-over');
});

document.addEventListener('dragleave', (ev) => {
	if (!ev.relatedTarget || ev.relatedTarget === document.documentElement) {
		dropZone.classList.remove('drag-over');
	}
});

document.addEventListener('drop', (ev) => {
	ev.preventDefault();
	dropZone.classList.remove('drag-over');
	
	const items = ev.dataTransfer?.items;
	if (items) {
		for (const item of items) {
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const blob = item.getAsFile();
				if (blob) {
					handleImageBlob(blob);
					break;
				}
			}
		}
	} else {
		// Fallback for older browsers or different interfaces
		const files = ev.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('image/')) {
				handleImageBlob(file);
			}
		}
	}
});

// ESC key handler to exit crop mode, drawing mode, or video preview
document.addEventListener('keydown', (ev) => {
	if (ev.key === 'Escape' || ev.key === 'Esc') {
		// Check if we're in a state that would be affected by ESC
		const inCropMode = overlayMap && selectionOverlay.style.display === 'block';
		const inDrawingMode = imageRect || canvasContainer.classList.contains('show');
		const inVideoPreview = videoPreviewOverlay.classList.contains('show');
		
		if (inCropMode || inDrawingMode || inVideoPreview) {
			// Show confirmation for all modes (image crop, image drawing, video preview)
			if (!confirmUnsavedChanges('exit')) {
				return;
			}
			resetState();
		}
	}
});

// Initial state
resetState();

// Warn user before closing tab/window with unsaved changes
window.addEventListener('beforeunload', (ev) => {
	if (checkHasUnsavedChanges()) {
		// Standard way to show a confirmation dialog before leaving
		ev.preventDefault();
		// For older browsers
		ev.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
		return ev.returnValue;
	}
});

// Detect OS for download path hint
const dlPathHint = document.getElementById('dlPathHint');
if (dlPathHint) {
	const platform = navigator.platform.toLowerCase();
	const isMac = platform.includes('mac');
	dlPathHint.textContent = isMac ? '~/Downloads' : 'Downloads';
}

window.addEventListener('resize', () => {
	if (imageRect) {
		ensureCanvasFillsMainArea();
	}
	// If the selection overlay is active, re-render it to fit the new window size.
	if (overlayMap && overlayMap.frameCanvas && selectionOverlay.style.display !== 'none') {
		renderSelectionOverlay(overlayMap.frameCanvas);
	}
});

// ============ Video Recording Functions ============

function formatTime(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateRecordingTimer() {
	if (!recordingStartTime) return;
	const elapsed = (Date.now() - recordingStartTime) / 1000;
	timerText.textContent = formatTime(elapsed);
}

function showRecordingUI() {
	isRecording = true;
	recordingOverlay.classList.add('show');
	dropZone.classList.remove('show');
	
	// Start timer
	recordingStartTime = Date.now();
	timerText.textContent = '00:00';
	recordingTimerInterval = setInterval(updateRecordingTimer, 1000);
}

function hideRecordingUI() {
	isRecording = false;
	recordingOverlay.classList.remove('show');
	
	// Stop timer
	if (recordingTimerInterval) {
		clearInterval(recordingTimerInterval);
		recordingTimerInterval = null;
	}
	recordingStartTime = null;
	timerText.textContent = '00:00';
}

function showVideoPreview(blob) {
	recordedBlob = blob;
	const url = URL.createObjectURL(blob);
	previewVideo.src = url;
	videoPreviewOverlay.classList.add('show');
	dropZone.classList.remove('show');
	
	// Set up toolbar for video preview mode
	setToolbarButtonsVisible(true);
	
	// Show video-specific buttons
	discardBtn.classList.remove('hidden');
	trimBtn.classList.remove('hidden');
	saveBtnWrapper.classList.remove('hidden');
	saveBtn.disabled = false;
	saveOptionsBtn.disabled = false;
	mainSeparator.classList.remove('hidden');
	
	// Hide image-specific annotation buttons
	copyBtn.classList.add('hidden');
	penBtn.classList.add('hidden');
	rectBtn.classList.add('hidden');
	styleBtn.classList.add('hidden');
	eraserBtn.classList.add('hidden');
	undoBtn.classList.add('hidden');
	redoBtn.classList.add('hidden');
	toolsSeparator.classList.add('hidden');
	
	// Hide trim mode buttons initially
	cancelTrimBtn.classList.add('hidden');
	applyTrimBtn.classList.add('hidden');
	trimControls.classList.remove('show');
	isInTrimMode = false;
	
	// Initialize trim controls once video metadata is loaded
	previewVideo.onloadedmetadata = () => {
		videoDuration = previewVideo.duration;
		trimStart = 0;
		trimEnd = videoDuration;
		updateTrimUI();
	};
	
	// Update playhead position during playback
	previewVideo.ontimeupdate = () => {
		updatePlayhead();
		// Auto-pause at trim end point (both in trim mode and when trimmed)
		if (isTrimmed() && previewVideo.currentTime >= trimEnd - 0.05) {
			previewVideo.pause();
			previewVideo.currentTime = trimEnd;
			if (isInTrimMode) {
				updateTrimPlayButtons(false);
			}
		}
	};
	
	// Update play button state when video ends or is paused externally
	previewVideo.onpause = () => {
		if (isInTrimMode) {
			updateTrimPlayButtons(false);
		}
	};
	
	previewVideo.onplay = () => {
		if (isInTrimMode) {
			updateTrimPlayButtons(true);
		}
		// When playing outside trim mode but video is trimmed, enforce trim start
		if (!isInTrimMode && isTrimmed() && previewVideo.currentTime < trimStart) {
			previewVideo.currentTime = trimStart;
		}
	};
}

// ============ Trim Functions ============

function updateTrimUI() {
	if (!videoDuration) return;
	
	const startPercent = (trimStart / videoDuration) * 100;
	const endPercent = (trimEnd / videoDuration) * 100;
	
	// Update handle positions
	trimHandleStart.style.left = `${startPercent}%`;
	trimHandleEnd.style.left = `${endPercent}%`;
	trimHandleEnd.style.right = 'auto';
	trimHandleEnd.style.transform = 'translateX(-50%)';
	
	// Update the highlighted region using a CSS variable
	trimBar.style.setProperty('--trim-start', `${startPercent}%`);
	trimBar.style.setProperty('--trim-end', `${endPercent}%`);
	
	// Update time displays
	trimInTime.textContent = formatTime(trimStart);
	trimOutTime.textContent = formatTime(trimEnd);
	
	// Update duration display
	const trimmedDuration = trimEnd - trimStart;
	trimDuration.textContent = `Duration: ${formatTime(trimmedDuration)}`;
	
	updatePlayhead();
}

function updatePlayhead() {
	if (!videoDuration) return;
	const percent = (previewVideo.currentTime / videoDuration) * 100;
	trimPlayhead.style.left = `${percent}%`;
}

function getTrimBarPosition(e) {
	const rect = trimBar.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const percent = Math.max(0, Math.min(1, x / rect.width));
	return percent * videoDuration;
}

function onTrimBarClick(e) {
	// Don't handle if dragging a handle
	if (isDraggingTrimHandle) return;
	
	// Check if clicking on a handle
	if (e.target === trimHandleStart || e.target === trimHandleEnd) return;
	
	const time = getTrimBarPosition(e);
	// Seek to clicked position (clamped to trim region)
	previewVideo.currentTime = Math.max(trimStart, Math.min(trimEnd, time));
}

function onTrimHandleMouseDown(e, handle) {
	e.preventDefault();
	e.stopPropagation();
	isDraggingTrimHandle = handle;
	document.addEventListener('mousemove', onTrimHandleMouseMove);
	document.addEventListener('mouseup', onTrimHandleMouseUp);
}

function onTrimHandleMouseMove(e) {
	if (!isDraggingTrimHandle) return;
	
	const time = getTrimBarPosition(e);
	
	if (isDraggingTrimHandle === 'start') {
		// Don't let start go past end - 0.1s minimum
		trimStart = Math.max(0, Math.min(trimEnd - 0.1, time));
	} else if (isDraggingTrimHandle === 'end') {
		// Don't let end go before start + 0.1s minimum
		trimEnd = Math.max(trimStart + 0.1, Math.min(videoDuration, time));
	}
	
	updateTrimUI();
}

function onTrimHandleMouseUp() {
	isDraggingTrimHandle = null;
	document.removeEventListener('mousemove', onTrimHandleMouseMove);
	document.removeEventListener('mouseup', onTrimHandleMouseUp);
}

function setTrimIn() {
	const newStart = previewVideo.currentTime;
	if (newStart < trimEnd - 0.1) {
		trimStart = newStart;
		updateTrimUI();
	}
}

function setTrimOut() {
	const newEnd = previewVideo.currentTime;
	if (newEnd > trimStart + 0.1) {
		trimEnd = newEnd;
		updateTrimUI();
	}
}

function resetTrim() {
	trimStart = 0;
	trimEnd = videoDuration;
	previewVideo.currentTime = 0;
	updateTrimUI();
}

function playTrimmedSection() {
	// Start from trim start if current time is outside trim range or at trim end
	const atOrPastTrimEnd = previewVideo.currentTime >= trimEnd - 0.1;
	const beforeTrimStart = previewVideo.currentTime < trimStart;
	
	if (beforeTrimStart || atOrPastTrimEnd) {
		previewVideo.currentTime = trimStart;
		// Wait for seek to complete before playing
		previewVideo.onseeked = () => {
			previewVideo.onseeked = null; // Clear the handler
			previewVideo.play();
			updateTrimPlayButtons(true);
		};
	} else {
		previewVideo.play();
		updateTrimPlayButtons(true);
	}
}

function stopTrimmedSection() {
	previewVideo.pause();
	updateTrimPlayButtons(false);
}

function updateTrimPlayButtons(isPlaying) {
	if (isPlaying) {
		trimPlayBtn.classList.add('hidden');
		trimStopBtn.classList.remove('hidden');
	} else {
		trimPlayBtn.classList.remove('hidden');
		trimStopBtn.classList.add('hidden');
	}
}

function enterTrimMode() {
	isInTrimMode = true;
	
	// Save current trim state in case of cancel
	savedTrimStart = trimStart;
	savedTrimEnd = trimEnd;
	
	// Show trim UI
	videoPreviewOverlay.classList.add('trim-mode');
	trimControls.classList.add('show');
	
	// Hide normal toolbar buttons
	modeToggle.style.display = 'none';
	newBtn.style.display = 'none';
	const delayWrapper = delayBtn.closest('.delay-btn-wrapper');
	if (delayWrapper) delayWrapper.style.display = 'none';
	discardBtn.classList.add('hidden');
	trimBtn.classList.add('hidden');
	saveBtnWrapper.classList.add('hidden');
	mainSeparator.classList.add('hidden');
	
	// Show trim mode buttons
	cancelTrimBtn.classList.remove('hidden');
	applyTrimBtn.classList.remove('hidden');
}

function exitTrimMode(applyChanges = false) {
	isInTrimMode = false;
	
	if (!applyChanges) {
		// Restore saved trim state
		trimStart = savedTrimStart;
		trimEnd = savedTrimEnd;
		updateTrimUI();
	}
	
	// Pause video and seek to trim start
	previewVideo.pause();
	previewVideo.currentTime = trimStart;
	
	// Hide trim UI
	videoPreviewOverlay.classList.remove('trim-mode');
	trimControls.classList.remove('show');
	
	// Show normal toolbar buttons
	modeToggle.style.display = '';
	newBtn.style.display = '';
	const delayWrapper = delayBtn.closest('.delay-btn-wrapper');
	if (delayWrapper) delayWrapper.style.display = '';
	discardBtn.classList.remove('hidden');
	trimBtn.classList.remove('hidden');
	saveBtnWrapper.classList.remove('hidden');
	mainSeparator.classList.remove('hidden');
	
	// Hide trim mode buttons
	cancelTrimBtn.classList.add('hidden');
	applyTrimBtn.classList.add('hidden');
	
	// Reset play buttons state
	updateTrimPlayButtons(false);
}

// Check if video is trimmed
function isTrimmed() {
	return trimStart > 0.01 || (videoDuration - trimEnd) > 0.01;
}

function hideVideoPreview() {
	// Just call resetState which now handles all video cleanup
	resetState();
}

// Get video for saving (trim is preview-only, saves full video)
function getVideoForSave() {
	return recordedBlob;
}

function saveVideoToFile(blob) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `recording-${Date.now()}.webm`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

async function saveAsVideoToFile(blob) {
	if (window.showSaveFilePicker) {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: `recording-${Date.now()}.webm`,
				types: [{
					description: 'WebM Video',
					accept: { 'video/webm': ['.webm'] },
				}],
			});
			const writable = await handle.createWritable();
			await writable.write(blob);
			await writable.close();
			return true; // Success
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.error('Save As failed:', err);
			}
			return false; // Cancelled or failed
		}
	}
	// Fallback to regular save if API not supported
	saveVideoToFile(blob);
	return true;
}

function cleanupRecordingStreams() {
	if (screenStream) {
		screenStream.getTracks().forEach(track => track.stop());
		screenStream = null;
	}
	if (micStream) {
		micStream.getTracks().forEach(track => track.stop());
		micStream = null;
	}
	mediaRecorder = null;
}

async function startRecording() {
	try {
		// Request screen capture first (so user can position their screen)
		screenStream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: false // System audio often not supported; we'll use mic instead
		});

		// Clear any previous image capture state now that we have a new recording
		resetState();

		// Auto-apply 5-second delay for fullscreen recording (just like image capture)
		let autoAppliedDelay = false;
		const [videoTrack] = screenStream.getVideoTracks();
		try {
			const settings = videoTrack.getSettings();
			if (settings.displaySurface === 'monitor' && captureDelay === 0) {
				captureDelay = 5000;
				updateDelayButtonText();
				autoAppliedDelay = true;
				
				// Update active state in delay menu
				delayMenu.querySelectorAll('.dropdown-item').forEach(el => {
					el.classList.toggle('active', parseInt(el.dataset.delay, 10) === 5000);
				});

				statusNotification.classList.add('show');
				console.log('Entire screen selected - automatically applying 5-second delay for recording');
			}
		} catch (err) {
			console.warn('Unable to detect display surface type:', err);
		}

		// Apply delay countdown if set (after screen is selected)
		if (captureDelay > 0) {
			delayBtn.classList.add('delaying');
			const originalTitle = document.title;
			countdownOverlay.classList.add('show');
			
			const totalSeconds = Math.ceil(captureDelay / 1000);
			for (let i = totalSeconds; i > 0; i--) {
				countdownNumber.textContent = i;
				document.title = `(${i}) ${originalTitle}`;
				countdownNumber.style.animation = 'none';
				setTimeout(() => {
					countdownNumber.style.animation = '';
				}, 10);
				await wait(1000);
			}
			
			countdownOverlay.classList.remove('show');
			delayBtn.classList.remove('delaying');
			document.title = originalTitle;
			
			// Hide status notification after countdown
			if (autoAppliedDelay) {
				statusNotification.classList.remove('show');
			}
		}

		// Request microphone
		try {
			micStream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true
				}
			});
		} catch (micErr) {
			console.warn('Microphone access denied, recording without audio:', micErr);
			micStream = null;
		}

		// Combine streams
		const tracks = [...screenStream.getVideoTracks()];
		if (micStream) {
			tracks.push(...micStream.getAudioTracks());
		}
		const combinedStream = new MediaStream(tracks);

		// Determine best supported format
		const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
			? 'video/webm;codecs=vp9,opus'
			: MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
				? 'video/webm;codecs=vp8,opus'
				: 'video/webm';

		// Initialize MediaRecorder
		recordedChunks = [];
		mediaRecorder = new MediaRecorder(combinedStream, { mimeType });

		mediaRecorder.ondataavailable = (event) => {
			if (event.data && event.data.size > 0) {
				recordedChunks.push(event.data);
			}
		};

		mediaRecorder.onstop = function() {
			console.log('Recording stopped, chunks:', recordedChunks.length);
			// Duration was captured in stopRecording() before recordingStartTime was cleared
			const duration = this._recordedDuration || 0;
			console.log('Recording duration:', duration, 'ms');
			cleanupRecordingStreams();
			
			// Create blob and fix duration metadata for proper seeking in external players
			if (recordedChunks.length > 0) {
				const rawBlob = new Blob(recordedChunks, { type: 'video/webm' });
				console.log('Fixing WebM duration metadata...');
				
				// ysFixWebmDuration injects proper duration so VLC/other players can seek
				ysFixWebmDuration(rawBlob, duration, { logger: false })
					.then((fixedBlob) => {
						console.log('Recording ready for preview:', fixedBlob.size, 'bytes');
						showVideoPreview(fixedBlob);
					});
			} else {
				dropZone.classList.add('show');
			}
		};

		// Handle user clicking "Stop sharing" in browser UI
		screenStream.getVideoTracks()[0].onended = () => {
			if (isRecording) {
				stopRecording();
			}
		};

		// Start recording
		mediaRecorder.start(1000); // Collect data every second
		showRecordingUI();
		console.log('Recording started with format:', mimeType);

	} catch (err) {
		console.error('Failed to start recording:', err);
		cleanupRecordingStreams();
		hideRecordingUI();
		dropZone.classList.add('show');
	}
}

function stopRecording() {
	// Capture duration BEFORE hideRecordingUI clears recordingStartTime
	const duration = recordingStartTime ? Date.now() - recordingStartTime : 0;
	
	if (mediaRecorder && mediaRecorder.state !== 'inactive') {
		// Store duration for onstop handler
		mediaRecorder._recordedDuration = duration;
		mediaRecorder.stop();
	}
	hideRecordingUI();
}

// ============ Mode Toggle Functions ============
function setMode(mode) {
	currentMode = mode;
	
	// Update toolbar toggle
	screenshotModeBtn.classList.toggle('active', mode === 'screenshot');
	recordModeBtn.classList.toggle('active', mode === 'record');
	
	// Update hero toggle
	heroScreenshotModeBtn.classList.toggle('active', mode === 'screenshot');
	heroRecordModeBtn.classList.toggle('active', mode === 'record');
	
	// Update hero button style (color only - text stays the same)
	const heroSplitBtn = document.querySelector('.hero-split-btn');
	if (mode === 'record') {
		heroSplitBtn.classList.add('record-mode');
		// Add record dot icon before logo but keep logo visible
		const existingDot = document.querySelector('.record-dot-icon');
		if (!existingDot) {
			heroActionIcon.insertAdjacentHTML('beforebegin', '<span class="record-dot-icon"></span>');
		}
		heroActionIcon.style.display = 'none';
	} else {
		heroSplitBtn.classList.remove('record-mode');
		// Remove record dot icon and show logo
		const recordDot = document.querySelector('.record-dot-icon');
		if (recordDot) recordDot.remove();
		heroActionIcon.style.display = '';
	}
	
	// Update hero button text based on delay (same for both modes)
	if (captureDelay > 0) {
		heroBtnText.textContent = t('newFormat', captureDelay / 1000);
	} else {
		heroBtnText.textContent = t('newSnip');
	}
}

// Mode toggle event listeners
screenshotModeBtn.addEventListener('click', () => setMode('screenshot'));
recordModeBtn.addEventListener('click', () => setMode('record'));
heroScreenshotModeBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	setMode('screenshot');
});
heroRecordModeBtn.addEventListener('click', (e) => {
	e.stopPropagation();
	setMode('record');
});

// Event listener for stop recording button
stopRecordBtn.addEventListener('click', () => {
	stopRecording();
});

// Event listener for discard button (handles both image and video)
discardBtn.addEventListener('click', () => {
	// Show confirmation popup before discarding
	if (!confirmUnsavedChanges('exit')) {
		return;
	}
	resetState();
});

// Trim controls event listeners
if (trimBar) {
	trimBar.addEventListener('click', onTrimBarClick);
}
if (trimHandleStart) {
	trimHandleStart.addEventListener('mousedown', (e) => onTrimHandleMouseDown(e, 'start'));
}
if (trimHandleEnd) {
	trimHandleEnd.addEventListener('mousedown', (e) => onTrimHandleMouseDown(e, 'end'));
}
if (setInBtn) {
	setInBtn.addEventListener('click', setTrimIn);
}
if (setOutBtn) {
	setOutBtn.addEventListener('click', setTrimOut);
}
if (resetTrimBtn) {
	resetTrimBtn.addEventListener('click', resetTrim);
}
if (trimPlayBtn) {
	trimPlayBtn.addEventListener('click', playTrimmedSection);
}
if (trimStopBtn) {
	trimStopBtn.addEventListener('click', stopTrimmedSection);
}

// Keyboard shortcuts for trim (I = in, O = out, Space = play/pause)
document.addEventListener('keydown', (e) => {
	if (!videoPreviewOverlay.classList.contains('show')) return;
	if (!isInTrimMode) return; // Only work in trim mode
	if (e.key === 'i' || e.key === 'I') {
		setTrimIn();
	} else if (e.key === 'o' || e.key === 'O') {
		setTrimOut();
	} else if (e.key === ' ') {
		e.preventDefault(); // Prevent page scroll
		if (previewVideo.paused) {
			playTrimmedSection();
		} else {
			stopTrimmedSection();
		}
	}
});

// Trim mode button listeners
if (trimBtn) {
	trimBtn.addEventListener('click', enterTrimMode);
}
if (cancelTrimBtn) {
	cancelTrimBtn.addEventListener('click', () => exitTrimMode(false));
}
if (applyTrimBtn) {
	applyTrimBtn.addEventListener('click', () => exitTrimMode(true));
}

// ============ i18n Setup ============
setupLanguagePicker({
	buttonId: 'langBtn',
	dropdownId: 'langDropdown',
	onToggle: () => {
		// Close other menus when language picker opens
		delayMenu.classList.remove('show');
		if (heroDelayMenu) heroDelayMenu.classList.remove('show');
		saveMenu.classList.remove('show');
	},
	onApply: () => {
		// Update dynamic text elements after language change
		updateDelayButtonText();
	}
});
applyTranslations();
// Update dynamic text after initial translation
updateDelayButtonText();
