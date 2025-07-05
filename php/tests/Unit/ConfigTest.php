<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class ConfigTest extends TestCase
{
    public function testConfigFileExists()
    {
        $this->assertFileExists(__DIR__ . '/../../config.php');
    }

    public function testConfigFileIsReadable()
    {
        $this->assertIsReadable(__DIR__ . '/../../config.php');
    }

    public function testConfigFileHasValidSyntax()
    {
        $configFile = __DIR__ . '/../../config.php';
        $output = [];
        $returnCode = 0;
        
        exec("php -l $configFile 2>&1", $output, $returnCode);
        
        $this->assertEquals(0, $returnCode, "Config file has syntax errors: " . implode("\n", $output));
    }
} 